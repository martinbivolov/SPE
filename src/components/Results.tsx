
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { useLifestyleQuestions } from "../hooks/useLifestyleQuestions";
import { useImagePickerOptions } from "../hooks/useImagePickerOptions";
import "./Results.css";

interface UserAnswer {
  question_id: string;
  answer_option_id: string | null;
  free_text_answer: string | null;
  answer_option_label: string | null;
}

interface SceneResult {
  id: string;
  completed_at: string;
  preferred_version: 'A' | 'B';
  preference_strength: number;
  exploration_phase: 'pre' | 'post';
  scene_name: string;
  video_a_url: string;
  video_b_url: string;
}

interface ProcessedResult extends SceneResult {
  post: SceneResult | null;
}

interface ResultsProps {
  userId: string;
}

const Results: React.FC<ResultsProps> = ({ userId }) => {
  const { t } = useTranslation();
  const [openLifestyle, setOpenLifestyle] = useState<string | null>(null);
  const [openSound, setOpenSound] = useState<string | null>(null);

  const { data: groups, loading: groupsLoading } = useLifestyleQuestions();
  const { data: imageOptions, loading: imagesLoading } = useImagePickerOptions();

  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [imagePicks, setImagePicks] = useState<string[]>([]);
  const [soundResults, setSoundResults] = useState<SceneResult[]>([]);
  const [answersLoading, setAnswersLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setAnswersLoading(true);

      const [answersRes, picksRes, soundRes] = await Promise.all([
        supabase
          .from("lifestyle_answers")
          .select("question_id, answer_option_id, free_text_answer, answer_options(label)")
          .eq("user_id", userId),
        supabase
          .from("image_picker_responses")
          .select("chosen_id")
          .eq("user_id", userId),
        supabase
          .from("session_results")
          .select(`
            id,
            completed_at,
            preferred_version,
            preference_strength,
            exploration_phase,
            scene_versions (
              video_a_url,
              video_b_url,
              scenes ( name )
            )
          `)
          .eq("user_id", userId)
          .order("completed_at", { ascending: true }),
      ]);

      const mapped = (answersRes.data ?? []).map((row: Record<string, unknown>) => ({
        question_id: row.question_id as string,
        answer_option_id: row.answer_option_id as string | null,
        free_text_answer: row.free_text_answer as string | null,
        answer_option_label: (row.answer_options as { label: string } | null)?.label ?? null,
      }));

      setUserAnswers(mapped);

      const uniqueIds = [
        ...new Set((picksRes.data ?? []).map((p: { chosen_id: string }) => p.chosen_id)),
      ];
      setImagePicks(uniqueIds);

      const normalisedSound = (soundRes.data ?? []).map((row: any) => ({
        id: row.id,
        completed_at: row.completed_at,
        preferred_version: row.preferred_version,
        preference_strength: row.preference_strength,
        exploration_phase: row.exploration_phase ?? 'pre',
        scene_name: row.scene_versions?.scenes?.name ?? 'Unknown',
        video_a_url: row.scene_versions?.video_a_url ?? '',
        video_b_url: row.scene_versions?.video_b_url ?? '',
      }));
      setSoundResults(normalisedSound);

      setAnswersLoading(false);
    };

    void fetchUserData();
  }, [userId]);

  // questionId → answers[]
  const answersByQuestion = useMemo(() => {
    const map = new Map<string, UserAnswer[]>();
    for (const a of userAnswers) {
      const list = map.get(a.question_id) ?? [];
      list.push(a);
      map.set(a.question_id, list);
    }
    return map;
  }, [userAnswers]);

  const getAnswerDisplay = (questionId: string): string => {
    const answers = answersByQuestion.get(questionId) ?? [];
    if (answers.length === 0) return "—";

    return answers
      .map((a) => {
        if (a.free_text_answer) return a.free_text_answer;
        if (a.answer_option_label) return a.answer_option_label;
        return "—";
      })
      .join(", ");
  };

  // For multi/quotes groups: collect all selected answer labels across all questions in the group
  const getSelectedLabelsForGroup = (groupId: string): string[] => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return [];

    const labels: string[] = [];
    for (const q of group.lifestyle_questions ?? []) {
      const answers = answersByQuestion.get(q.id) ?? [];
      for (const a of answers) {
        const label = a.free_text_answer ?? a.answer_option_label;
        if (label) labels.push(label);
      }
    }
    return labels;
  };

  const isMultiOrQuotesGroup = (groupId: string): boolean => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return false;
    const questions = group.lifestyle_questions ?? [];
    return questions.length > 0 && questions.every((q) => q.type === "multi" || q.type === "quotes");
  };

  const toggleLifestyle = (key: string) => {
    setOpenLifestyle(openLifestyle === key ? null : key);
  };

  const strengthLabel = (strength: number): string => {
    const labels: Record<number, string> = {
      1: t('sound.preference.veryWeak'),
      2: t('sound.preference.weak'),
      3: t('sound.preference.hesitant'),
      4: t('sound.preference.strong'),
      5: t('sound.preference.veryStrong'),
    };
    return labels[strength] ?? 'Unknown';
  };

  const processedSoundResults = useMemo((): ProcessedResult[] => {
    const pre = soundResults.filter(r => r.exploration_phase === 'pre');
    const post = soundResults.filter(r => r.exploration_phase === 'post');
    return pre.map(preResult => {
      const postResult = post.find(p => p.scene_name === preResult.scene_name);
      const changed = postResult &&
        postResult.preferred_version !== preResult.preferred_version;
      return { ...preResult, post: changed ? postResult : null };
    });
  }, [soundResults]);

  const isLoading = groupsLoading || imagesLoading || answersLoading;

  if (isLoading) {
    return <div className="dt-container"><p>Loading results...</p></div>;
  }

  const imagePickLabels = imagePicks
    .map((id) => imageOptions.find((o) => o.id === id)?.label)
    .filter((label): label is string => label != null);

  return (
    <div className="dt-container">
      {/* ================= LIFESTYLE ================= */}
      <h2>{t('digitalTwin.lifestyle')}</h2>

      <div className="dt-header">
        <div></div>
        <div>{t('digitalTwin.category')}</div>
        <div>{t('digitalTwin.question')}</div>
        <div>{t('digitalTwin.selection')}</div>
      </div>

      {groups.map((group) => {
        const multiQuotes = isMultiOrQuotesGroup(group.id);

        return (
          <div key={group.id}>
            <div
              className="dt-row dt-main"
              onClick={() => toggleLifestyle(group.id)}
            >
              <div>{openLifestyle === group.id ? "▼" : "▶"}</div>
              <div>{group.title}</div>
              <div></div>
              <div></div>
            </div>

            {openLifestyle === group.id && multiQuotes && (
              <>
                {getSelectedLabelsForGroup(group.id).length > 0 ? (
                  getSelectedLabelsForGroup(group.id).map((label, i) => (
                    <div className="dt-row dt-alt" key={i}>
                      <div></div>
                      <div></div>
                      <div>{label}</div>
                      <div>Selected</div>
                    </div>
                  ))
                ) : (
                  <div className="dt-row dt-alt">
                    <div></div>
                    <div></div>
                    <div>No selections made</div>
                    <div>—</div>
                  </div>
                )}
              </>
            )}

            {openLifestyle === group.id && !multiQuotes &&
              (group.lifestyle_questions ?? []).map((q) => (
                <div className="dt-row dt-alt" key={q.id}>
                  <div></div>
                  <div></div>
                  <div>{q.text}</div>
                  <div>{getAnswerDisplay(q.id)}</div>
                </div>
              ))}
          </div>
        );
      })}

      {/* IMAGE PICKER */}
      <div
        className="dt-row dt-main"
        onClick={() => toggleLifestyle("image-picker")}
      >
        <div>{openLifestyle === "image-picker" ? "▼" : "▶"}</div>
        <div>Pick what matters most to you</div>
        <div></div>
        <div></div>
      </div>

      {openLifestyle === "image-picker" &&
        (imagePickLabels.length > 0 ? (
          imagePickLabels.map((label, i) => (
            <div className="dt-row dt-alt" key={i}>
              <div></div>
              <div></div>
              <div>{label}</div>
              <div>Selected</div>
            </div>
          ))
        ) : (
          <div className="dt-row dt-alt">
            <div></div>
            <div></div>
            <div>No images selected</div>
            <div>—</div>
          </div>
        ))}

      {/* ================= SOUND ================= */}
      <h2 className="dt-section">{t('digitalTwin.sound')}</h2>

      <div className="dt-header">
        <div></div>
        <div>{t('digitalTwin.created')}</div>
        <div>{t('digitalTwin.preference')}</div>
        <div>{t('digitalTwin.variant')}</div>
      </div>

      {processedSoundResults.length === 0 ? (
        <div className="dt-row dt-alt">
          <div></div>
          <div>{t('digitalTwin.noResults')}</div>
          <div>—</div>
          <div>—</div>
        </div>
      ) : (
        processedSoundResults.map((result) => (
          <div key={result.id}>
            <div
              className="dt-row dt-main"
              onClick={() => setOpenSound(openSound === result.id ? null : result.id)}
            >
              <div>{openSound === result.id ? '▼' : '▶'}</div>
              <div>{new Date(result.completed_at).toLocaleString()}</div>
              <div>{strengthLabel(result.preference_strength)}</div>
              <div>
                {result.preferred_version === 'A'
                  ? t('digitalTwin.preferFirst')
                  : t('digitalTwin.preferSecond')}
              </div>
            </div>

            {result.post && (
              <div className="dt-row dt-alt">
                <div></div>
                <div>{t('digitalTwin.afterExploring')}</div>
                <div>{strengthLabel(result.post.preference_strength)}</div>
                <div>
                  {result.post.preferred_version === 'A'
                    ? t('digitalTwin.stillPreferFirst')
                    : t('digitalTwin.changedToSecond')}
                </div>
              </div>
            )}

            {openSound === result.id && (
              <div className="dt-audio">
                <div className="dt-audio-grid">
                  <div>
                    <p>{t('digitalTwin.variantA')}</p>
                    <audio controls>
                      <source src={result.video_a_url} />
                    </audio>
                  </div>
                  <div>
                    <p>{t('digitalTwin.variantB')}</p>
                    <audio controls>
                      <source src={result.video_b_url} />
                    </audio>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Results;
