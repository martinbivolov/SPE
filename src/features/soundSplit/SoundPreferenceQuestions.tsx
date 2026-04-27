import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Input,
  NativeSelect,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import StageButton from '../../components/StageButton';
import { useLifestyleQuestions } from '../../hooks/useLifestyleQuestions';
import { useSaveQuizAnswers } from '../../hooks/useSaveQuizAnswers';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../hooks/useTranslations';
import { supabase } from '../../lib/supabase';
import type { QuizAnswerEntry } from '../../hooks/useSaveQuizAnswers';

interface SoundPreferenceQuestionsProps {
  userId: string;
  onNext: () => void;
  onBack: () => void;
}

const SoundPreferenceQuestions: React.FC<SoundPreferenceQuestionsProps> = ({
  userId,
  onNext,
  onBack,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { translate: translateGroup } = useTranslations('lifestyle_question_groups', 'title');
  const { translate: translateQuestion } = useTranslations('lifestyle_questions', 'text');
  const { translate: translateOption } = useTranslations('answer_options', 'label');
  const { data: groups, loading, error } = useLifestyleQuestions();
  const { loading: saving, error: saveError, saveAnswers } = useSaveQuizAnswers();

  const [selections, setSelections] = useState<Record<string, string>>({});
  const [freeTexts, setFreeTexts] = useState<Record<string, string>>({});
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  // Stays false until the profile load resolves — prevents the step-save
  // useEffect from writing quiz_step: 0 before the real value is read.
  const [quizStepLoaded, setQuizStepLoaded] = useState(false);

  // Step 2 — load existing answers and saved step index on mount
  useEffect(() => {
    const loadExistingAnswers = async () => {
      const [profileRes, answersRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('quiz_step')
          .eq('id', userId)
          .single(),
        supabase
          .from('lifestyle_answers')
          .select('question_id, answer_option_id, free_text_answer')
          .eq('user_id', userId),
      ]);

      const profileData = profileRes.data;
      const existingAnswers = answersRes.data;

      console.log('[quiz] loaded quiz_step:', profileData?.quiz_step);
      console.log('[quiz] setting group index to:', profileData?.quiz_step ?? 0);

      if (profileData?.quiz_step) {
        setCurrentGroupIndex(profileData.quiz_step);
      }

      // Mark step as loaded — the save useEffect can now safely fire.
      setQuizStepLoaded(true);

      if (!existingAnswers || existingAnswers.length === 0) return;

      const newFreeTexts: Record<string, string> = {};
      const newSelections: Record<string, string> = {};

      for (const answer of existingAnswers) {
        if (answer.free_text_answer) {
          newFreeTexts[answer.question_id] = answer.free_text_answer;
        }
        if (answer.answer_option_id) {
          newSelections[answer.question_id] = answer.answer_option_id;
        }
      }

      setFreeTexts((prev) => ({ ...prev, ...newFreeTexts }));
      setSelections((prev) => ({ ...prev, ...newSelections }));
    };

    void loadExistingAnswers();
  }, [userId]);

  // Step 3 — persist current step index whenever it advances.
  // The quizStepLoaded guard prevents writing 0 back to the DB on mount
  // before the real saved value has been read from profiles.
  useEffect(() => {
    if (!userId || !quizStepLoaded) return;
    supabase
      .from('profiles')
      .update({ quiz_step: currentGroupIndex })
      .eq('id', userId)
      .then(() => {});
  }, [currentGroupIndex, userId, quizStepLoaded]);

  const allQuestions = useMemo(
    () => groups.flatMap((g) => g.lifestyle_questions ?? []),
    [groups],
  );

  const hearingAidQuestion = useMemo(
    () => allQuestions.find((q) => q.text?.toLowerCase().includes('do you currently wear hearing aids')),
    [allQuestions],
  );

  const howLongQuestion = useMemo(
    () => allQuestions.find((q) => q.text?.toLowerCase().includes('how long have you had them')),
    [allQuestions],
  );

  const notWearingOption = useMemo(
    () => hearingAidQuestion?.answer_options?.find((o) => o.label?.toLowerCase().includes('not wearing')),
    [hearingAidQuestion],
  );

  const howLongDisabled = useMemo(() => {
    if (!hearingAidQuestion || !notWearingOption) return false;
    return selections[hearingAidQuestion.id] === notWearingOption.id;
  }, [selections, hearingAidQuestion, notWearingOption]);

  useEffect(() => {
    if (howLongDisabled && howLongQuestion) {
      setFreeTexts((prev) => ({ ...prev, [howLongQuestion.id]: '' }));
    }
  }, [howLongDisabled, howLongQuestion]);

  const visibleGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          lifestyle_questions: (group.lifestyle_questions ?? []).filter(
            (q) => q.type === 'single' || q.type === 'free_text',
          ),
        }))
        .filter((g) => g.lifestyle_questions.length > 0),
    [groups],
  );

  const currentGroup = visibleGroups[currentGroupIndex];
  const isLastGroup = currentGroupIndex === visibleGroups.length - 1;

  const handleSelect = (questionId: string, value: string) => {
    setSelections((prev) => ({ ...prev, [questionId]: value }));
  };

  // Disable follow-up questions until their parent question has a relevant answer selected
  const isFollowUpEnabled = (question: typeof currentGroup.lifestyle_questions[number]) => {
    const text = question.text.toLowerCase();
    const questions = currentGroup?.lifestyle_questions ?? [];
    const idx = questions.indexOf(question);

    if (text.includes('if yes')) {
      if (idx <= 0) return true;
      const prevQuestion = questions[idx - 1];
      const selectedOptionId = selections[prevQuestion.id];
      if (!selectedOptionId) return false;
      const selectedOption = prevQuestion.answer_options?.find((o) => o.id === selectedOptionId);
      return selectedOption?.label?.toLowerCase() === 'yes';
    }

    if (text.includes('if you wear')) {
      if (idx <= 0) return true;
      const prevQuestion = questions[idx - 1];
      const selectedOptionId = selections[prevQuestion.id];
      if (!selectedOptionId) return false;
      const selectedOption = prevQuestion.answer_options?.find((o) => o.id === selectedOptionId);
      const label = selectedOption?.label?.toLowerCase() ?? '';
      return label !== 'no' && label !== '' && !label.includes('never');
    }

    return true;
  };

  const handleNextGroup = async () => {
    if (!isLastGroup) {
      setCurrentGroupIndex((i) => i + 1);
      return;
    }

    const entries: QuizAnswerEntry[] = [];

    for (const group of visibleGroups) {
      for (const question of group.lifestyle_questions) {
        if (question.type === 'free_text') {
          const text = freeTexts[question.id]?.trim();
          const answerOptionId = question.answer_options?.[0]?.id;
          if (text && answerOptionId) {
            entries.push({ questionId: question.id, questionType: 'free_text', answerOptionId, textValue: text });
          }
        } else {
          const selected = selections[question.id];
          if (selected) {
            entries.push({
              questionId: question.id,
              questionType: question.type as 'single' | 'multi',
              answerOptionId: selected,
            });
          }
        }
      }
    }

    // Resolve name and language before firing parallel requests
    const allQuestions = visibleGroups.flatMap(g => g.lifestyle_questions ?? []);

    const nameQuestion = allQuestions.find(q =>
      q.text?.toLowerCase().includes('name')
    );
    const langQuestion = allQuestions.find(q =>
      q.text?.toLowerCase().includes('language')
    );

    const nameValue = nameQuestion
      ? freeTexts[nameQuestion.id]?.trim()
      : undefined;

    const langOptionId = langQuestion
      ? selections[langQuestion.id]
      : undefined;

    const langOption = langQuestion?.answer_options?.find(
      o => o.id === langOptionId
    );

    const languageCode = ({
      'English': 'en',
      'Danish': 'da',
      'Bulgarian': 'bg',
      'Hungarian': 'hu',
      'Brazilian (Portuguese)': 'pt',
    } as Record<string, string>)[langOption?.label ?? ''] ?? 'en';

    // Build profile update object — only include defined values.
    // quiz_step is intentionally NOT reset here: it stays at the last group
    // index so Back from the next section returns to the correct group.
    // The full reset (quiz_step: 0, quiz_section: 0) only happens in
    // LifestyleExploration when currentStep === 6 (final completion).
    const profileUpdate: Record<string, string> = {};
    if (nameValue) profileUpdate.name = nameValue;
    if (langOption) profileUpdate.preferred_language = languageCode;

    const [ok] = await Promise.all([
      saveAnswers(userId, entries),
      Object.keys(profileUpdate).length > 0
        ? supabase.from('profiles').update(profileUpdate).eq('id', userId)
        : Promise.resolve(null),
    ]);

    if (ok) {
      console.log('[quiz] advancing to next section, current quiz_step:', currentGroupIndex, 'NOT resetting');
      onNext();
    }
  };

  const handleBackGroup = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex((i) => i - 1);
    } else {
      onBack();
    }
  };

  if (loading || !quizStepLoaded) {
    return (
      <Flex direction="column" align="center" justify="center" minH="420px" gap={3}>
        <Spinner size="lg" color="purple.500" />
        <Text color="gray.600" _dark={{ color: 'gray.300' }}>
          Loading questions...
        </Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={6} border="1px solid" borderColor="red.200" borderRadius="md" bg="red.50">
        <Text color="red.600" fontWeight="600">
          Could not load questions: {error}
        </Text>
      </Box>
    );
  }

  return (
    <Box
      maxW="1120px"
      w="100%"
      mx="auto"
      bg="white"
      _dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
      p={{ base: 4, md: 10 }}
      border="1px solid"
      borderColor="gray.300"
      boxShadow="lg"
      display="flex"
      flexDirection="column"
      minH={{ base: 'auto', md: 'calc(100vh - 220px)' }}
      maxH="calc(100vh - 220px)"
      overflow="hidden"
    >
      <Text
        fontSize={{ base: 'xl', md: '4xl' }}
        fontWeight="700"
        textAlign="center"
        color="gray.800"
        _dark={{ color: 'gray.100' }}
        mb={2}
      >
        {t('profile.title')}
      </Text>

      {currentGroup && (
        <Text
          fontSize={{ base: 'sm', md: 'md' }}
          textAlign="center"
          color="gray.500"
          _dark={{ color: 'gray.400' }}
          mb={{ base: 4, md: 8 }}
        >
          {translateGroup(currentGroup.id, currentGroup.title)} &mdash; {t('lifestyle.step', { current: currentGroupIndex + 1, total: visibleGroups.length })}
        </Text>
      )}

      {saveError && (
        <Text mb={4} color="red.500" fontSize="sm" fontWeight="600">
          Could not save your answers: {saveError}
        </Text>
      )}

      <Box
        flex="1"
        overflowY="auto"
        mb={8}
        py={{ base: 4, md: 6 }}
        pr={{ base: 4, md: 6 }}
        css={{
          '&::-webkit-scrollbar': { width: '10px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: 'rgb(168, 85, 247)', borderRadius: '999px' },
          '&::-webkit-scrollbar-thumb:hover': { background: 'rgb(147, 51, 234)' },
        }}
      >
        {currentGroup && (
          <Stack gap={{ base: 5, md: 6 }}>
            {currentGroup.lifestyle_questions.map((question) => {
              const enabled = isFollowUpEnabled(question);
              const isHowLongDisabled = question.id === howLongQuestion?.id && howLongDisabled;
              const isDisabled = !enabled || isHowLongDisabled;
              return (
              <Box key={question.id} opacity={isDisabled ? 0.4 : 1} pointerEvents={isDisabled ? 'none' : 'auto'}>
                <Text
                  fontSize={{ base: 'sm', md: 'md' }}
                  fontWeight="500"
                  mb={2}
                  color="gray.700"
                  _dark={{ color: 'gray.200' }}
                >
                  {translateQuestion(question.id, question.text)}
                </Text>
                {question.type === 'free_text' ? (
                  <Input
                    placeholder={isHowLongDisabled ? 'Not applicable' : t('common.typeAnswer')}
                    value={freeTexts[question.id] ?? ''}
                    onChange={(e) =>
                      setFreeTexts((prev) => ({ ...prev, [question.id]: e.target.value }))
                    }
                    bg="white"
                    _dark={{ bg: 'gray.700' }}
                    disabled={isDisabled}
                    opacity={isHowLongDisabled ? 0.4 : 1}
                    cursor={isHowLongDisabled ? 'not-allowed' : 'text'}
                    pl={3}
                  />
                ) : (
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      value={selections[question.id] ?? ''}
                      onChange={(e) => handleSelect(question.id, e.target.value)}
                      bg="white"
                      _dark={{ bg: 'gray.700' }}
                      pl={3}
                    >
                      <option value="" disabled>
                        {t('common.selectOption')}
                      </option>
                      {(question.answer_options ?? []).map((option) => (
                        <option key={option.id} value={option.id}>
                          {translateOption(option.id, option.label)}
                        </option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                )}
              </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      <Flex justify="space-between" w="100%">
        <StageButton variantType="outline" onClick={handleBackGroup}>
          {t('common.back')}
        </StageButton>
        <StageButton variantType="primary" loading={saving} onClick={() => void handleNextGroup()}>
          {t('common.next')}
        </StageButton>
      </Flex>
    </Box>
  );
};

export default SoundPreferenceQuestions;
