import React, { useState } from 'react';
import {
  Box,
  Stack,
  Input,
  Button,
  Flex,
  Text,
  NativeSelect,
} from '@chakra-ui/react';
import { useSaveQuizAnswers, type QuizAnswerEntry } from '../../hooks/useSaveQuizAnswers';

// ---------------------------------------------------------------------------
// Schema question IDs (seeded with fixed UUIDs in the V3 migration)
// ---------------------------------------------------------------------------

const Q_FAMILY_HISTORY     = '00000000-0000-0000-0002-000000000203'; // single
const Q_NOISE_EXPOSURE     = '00000000-0000-0000-0002-000000000204'; // single
const Q_NOISE_WHERE        = '00000000-0000-0000-0002-000000000205'; // multi (single-select UI)
const Q_MEDICATIONS        = '00000000-0000-0000-0002-000000000206'; // free_text
const Q_WEARING_AIDS       = '00000000-0000-0000-0002-000000000207'; // single
const Q_AIDS_DURATION      = '00000000-0000-0000-0002-000000000402'; // free_text
const Q_AIDS_EXPERIENCE    = '00000000-0000-0000-0002-000000000403'; // single
const Q_PHONE_TYPE         = '00000000-0000-0000-0002-000000000404'; // single
const Q_READY_TO_MOVE      = '00000000-0000-0000-0002-000000000405'; // single

// ---------------------------------------------------------------------------
// Answer option IDs (seeded with fixed UUIDs in the V3 migration)
// The select value for each field IS the answer_option_id UUID.
// ---------------------------------------------------------------------------

// Q203 — family history
const OPT_FAMILY_YES       = '00000000-0000-0000-0003-020300000001';
const OPT_FAMILY_NO        = '00000000-0000-0000-0003-020300000002';
const OPT_FAMILY_NOT_SURE  = '00000000-0000-0000-0003-020300000003';

// Q204 — noise exposure
const OPT_NOISE_YES        = '00000000-0000-0000-0003-020400000001';
const OPT_NOISE_NO         = '00000000-0000-0000-0003-020400000002';

// Q205 — where exposed
const OPT_NOISE_WORKPLACE  = '00000000-0000-0000-0003-020500000001';
const OPT_NOISE_MILITARY   = '00000000-0000-0000-0003-020500000002';
const OPT_NOISE_MUSIC      = '00000000-0000-0000-0003-020500000003';
const OPT_NOISE_OTHER      = '00000000-0000-0000-0003-020500000004';

// Q207 — currently wearing hearing aids
const OPT_AIDS_CURRENTLY   = '00000000-0000-0000-0003-020700000001';
const OPT_AIDS_NOT_WEARING = '00000000-0000-0000-0003-020700000002';
const OPT_AIDS_PREV_WORE   = '00000000-0000-0000-0003-020700000003';

// Q403 — experience with hearing aids
const OPT_EXP_SATISFIED    = '00000000-0000-0000-0003-040300000001';
const OPT_EXP_MEH          = '00000000-0000-0000-0003-040300000002';
const OPT_EXP_HATE_IT      = '00000000-0000-0000-0003-040300000003';

// Q404 — smartphone type
const OPT_PHONE_APPLE      = '00000000-0000-0000-0003-040400000001';
const OPT_PHONE_ANDROID    = '00000000-0000-0000-0003-040400000002';
const OPT_PHONE_DONT_KNOW  = '00000000-0000-0000-0003-040400000003';
const OPT_PHONE_NONE       = '00000000-0000-0000-0003-040400000004';

// Q405 — ready to move forward
const OPT_READY_YES        = '00000000-0000-0000-0003-040500000001';
const OPT_READY_NO         = '00000000-0000-0000-0003-040500000002';
const OPT_READY_MORE_INFO  = '00000000-0000-0000-0003-040500000003';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface LifestyleQuestionsProps {
  onNext: () => void;
  onBack: () => void;
  userId: string;
}

interface FormState {
  familyHistory: string;
  noiseExposure: string;
  noiseExposureWhere: string;
  medicalConditions: string;
  wearingHearingAids: string;
  hearingAidsDuration: string;
  hearingAidExperience: string;
  phoneType: string;
  readyToMoveForward: string;
}

const EMPTY_FORM: FormState = {
  familyHistory: '',
  noiseExposure: '',
  noiseExposureWhere: '',
  medicalConditions: '',
  wearingHearingAids: '',
  hearingAidsDuration: '',
  hearingAidExperience: '',
  phoneType: '',
  readyToMoveForward: '',
};

const LifestyleQuestions: React.FC<LifestyleQuestionsProps> = ({
  onNext,
  onBack,
  userId,
}) => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const { loading, error, saveAnswers } = useSaveQuizAnswers();

  const set = (key: keyof FormState) => (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  // Build the typed entry list from current form state.
  // Fields left empty are omitted — no partial rows are inserted.
  const buildEntries = (): QuizAnswerEntry[] => {
    const entries: QuizAnswerEntry[] = [];

    if (form.familyHistory) {
      entries.push({ questionId: Q_FAMILY_HISTORY, questionType: 'single', answerOptionId: form.familyHistory });
    }
    if (form.noiseExposure) {
      entries.push({ questionId: Q_NOISE_EXPOSURE, questionType: 'single', answerOptionId: form.noiseExposure });
    }
    // Q205 is type 'multi' in the schema; the UI allows one selection at a time.
    if (form.noiseExposureWhere) {
      entries.push({ questionId: Q_NOISE_WHERE, questionType: 'multi', answerOptionId: form.noiseExposureWhere });
    }
    if (form.medicalConditions.trim()) {
      entries.push({ questionId: Q_MEDICATIONS, questionType: 'free_text', textValue: form.medicalConditions.trim() });
    }
    if (form.wearingHearingAids) {
      entries.push({ questionId: Q_WEARING_AIDS, questionType: 'single', answerOptionId: form.wearingHearingAids });
    }
    if (form.hearingAidsDuration.trim()) {
      entries.push({ questionId: Q_AIDS_DURATION, questionType: 'free_text', textValue: form.hearingAidsDuration.trim() });
    }
    if (form.hearingAidExperience) {
      entries.push({ questionId: Q_AIDS_EXPERIENCE, questionType: 'single', answerOptionId: form.hearingAidExperience });
    }
    if (form.phoneType) {
      entries.push({ questionId: Q_PHONE_TYPE, questionType: 'single', answerOptionId: form.phoneType });
    }
    if (form.readyToMoveForward) {
      entries.push({ questionId: Q_READY_TO_MOVE, questionType: 'single', answerOptionId: form.readyToMoveForward });
    }

    return entries;
  };

  const handleNext = async () => {
    const ok = await saveAnswers(userId, buildEntries());
    if (ok) onNext();
  };

  return (
    <Box
      maxW="800px"
      w="100%"
      mx="auto"
      bg="white"
      p={10}
      border="1px solid"
      borderColor="gray.300"
      _dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
      boxShadow="lg"
      display="flex"
      flexDirection="column"
      minH="calc(100vh - 220px)"
      maxH="calc(100vh - 220px)"
      overflow="hidden"
    >
      <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={6} color="gray.800" _dark={{ color: 'gray.100' }}>
        Lifestyle Exploration
      </Text>

      {error && (
        <Text mb={4} color="red.500" fontSize="sm" fontWeight="600">
          {error}
        </Text>
      )}

      <Box
        flex="1"
        overflowY="auto"
        px={4}
        py={0}
        mb={6}
        bgGradient="linear(to-r, white 0%, white 98%, rgb(168, 85, 247) 100%)"
        _dark={{ bg: 'gray.700' }}
        css={{
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: 'rgb(168, 85, 247)', borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb:hover': { background: 'rgb(147, 51, 234)' },
        }}
      >
        <Stack gap={4}>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              Is there a history of hearing loss in your family?
            </Text>
            <NativeSelect.Root>
              <NativeSelect.Field value={form.familyHistory} onChange={set('familyHistory')}>
                <option value="" disabled></option>
                <option value={OPT_FAMILY_YES}>Yes</option>
                <option value={OPT_FAMILY_NO}>No</option>
                <option value={OPT_FAMILY_NOT_SURE}>Not sure</option>
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              Have you ever experienced loud noise for an extended period of time?
            </Text>
            <NativeSelect.Root>
              <NativeSelect.Field value={form.noiseExposure} onChange={set('noiseExposure')}>
                <option value="" disabled></option>
                <option value={OPT_NOISE_YES}>Yes</option>
                <option value={OPT_NOISE_NO}>No</option>
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              If yes, where were you exposed to loud noise?
            </Text>
            <NativeSelect.Root>
              <NativeSelect.Field value={form.noiseExposureWhere} onChange={set('noiseExposureWhere')}>
                <option value="" disabled></option>
                <option value={OPT_NOISE_WORKPLACE}>Workplace</option>
                <option value={OPT_NOISE_MILITARY}>Military service</option>
                <option value={OPT_NOISE_MUSIC}>Music or concerts</option>
                <option value={OPT_NOISE_OTHER}>Other</option>
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              Please list any medications or medical conditions you are currently being treated for:
            </Text>
            <Input
              w="100%"
              variant="outline"
              placeholder="e.g., Hypertension, Diabetes, etc."
              value={form.medicalConditions}
              onChange={set('medicalConditions')}
            />
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              Do you currently wear hearing aids?
            </Text>
            <NativeSelect.Root>
              <NativeSelect.Field value={form.wearingHearingAids} onChange={set('wearingHearingAids')}>
                <option value="" disabled></option>
                <option value={OPT_AIDS_CURRENTLY}>Currently Wearing</option>
                <option value={OPT_AIDS_NOT_WEARING}>Not Wearing</option>
                <option value={OPT_AIDS_PREV_WORE}>Previously Wore</option>
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              If you wear or have worn hearing aids, how long have you had them?
            </Text>
            <Input
              w="100%"
              variant="outline"
              placeholder="e.g., 3 months, 1 year, etc."
              value={form.hearingAidsDuration}
              onChange={set('hearingAidsDuration')}
            />
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              How would you describe your experience with your current or previous hearing aids?
            </Text>
            <NativeSelect.Root>
              <NativeSelect.Field value={form.hearingAidExperience} onChange={set('hearingAidExperience')}>
                <option value="" disabled></option>
                <option value={OPT_EXP_SATISFIED}>Satisfied</option>
                <option value={OPT_EXP_MEH}>Meh</option>
                <option value={OPT_EXP_HATE_IT}>Hate It</option>
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              What type of smartphone do you use?
            </Text>
            <NativeSelect.Root>
              <NativeSelect.Field value={form.phoneType} onChange={set('phoneType')}>
                <option value="" disabled></option>
                <option value={OPT_PHONE_APPLE}>Apple</option>
                <option value={OPT_PHONE_ANDROID}>Android</option>
                <option value={OPT_PHONE_DONT_KNOW}>Don't know</option>
                <option value={OPT_PHONE_NONE}>Don't use a smartphone</option>
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700" _dark={{ color: 'gray.200' }}>
              If new hearing aids are recommended, are you ready to move forward today?
            </Text>
            <NativeSelect.Root>
              <NativeSelect.Field value={form.readyToMoveForward} onChange={set('readyToMoveForward')}>
                <option value="" disabled></option>
                <option value={OPT_READY_YES}>Yes</option>
                <option value={OPT_READY_NO}>No</option>
                <option value={OPT_READY_MORE_INFO}>Need more information first</option>
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>

        </Stack>
      </Box>

      <Flex justify="flex-end" gap={3}>
        <Button variant="outline" colorPalette="purple" onClick={onBack}>
          Back
        </Button>
        <Button colorPalette="purple" loading={loading} onClick={() => void handleNext()}>
          Next
        </Button>
      </Flex>
    </Box>
  );
};

export default LifestyleQuestions;
