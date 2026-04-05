
import React, { useEffect, useMemo, useState } from "react";
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

interface ResultsProps {
  userId: string;
}

const Results: React.FC<ResultsProps> = ({ userId }) => {
  const [openLifestyle, setOpenLifestyle] = useState<string | null>(null);
  const [openSound, setOpenSound] = useState<string | null>(null);

  const { data: groups, loading: groupsLoading } = useLifestyleQuestions();
  const { data: imageOptions, loading: imagesLoading } = useImagePickerOptions();

  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [imagePicks, setImagePicks] = useState<string[]>([]);
  const [answersLoading, setAnswersLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setAnswersLoading(true);

      const [answersRes, picksRes] = await Promise.all([
        supabase
          .from("lifestyle_answers")
          .select("question_id, answer_option_id, free_text_answer, answer_options(label)")
          .eq("user_id", userId),
        supabase
          .from("image_picker_responses")
          .select("chosen_id")
          .eq("user_id", userId),
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
      <h2>Lifestyle Results</h2>

      <div className="dt-header">
        <div></div>
        <div>Category</div>
        <div>Question / Item</div>
        <div>User Selection</div>
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
      <h2 className="dt-section">Sound Preference Results</h2>

      <div className="dt-header">
        <div></div>
        <div>Created</div>
        <div>Preference</div>
        <div>Variant</div>
      </div>

      {["1", "2", "3", "4"].map((id, i) => (
        <div key={id}>
          <div
            className="dt-row dt-main"
            onClick={() =>
              setOpenSound(openSound === id ? null : id)
            }
          >
            <div>{openSound === id ? "▼" : "▶"}</div>
            <div>2026-09-07 14:38:03</div>
            <div>
              {["Strong", "Weak", "Hesitant", "Strong"][i]}
            </div>
            <div>
              {
                [
                  "Prefer first variant",
                  "Prefer second variant",
                  "Prefer first variant",
                  "Prefer first variant",
                ][i]
              }
            </div>
          </div>

          {openSound === id && (
            <div className="dt-audio">
              <div className="dt-audio-grid">
                <div>
                  <p>Variant A</p>
                  <audio controls>
                    <source src="/audio/sample-a.mp3" />
                  </audio>
                </div>

                <div>
                  <p>Variant B</p>
                  <audio controls>
                    <source src="/audio/sample-b.mp3" />
                  </audio>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Results;
