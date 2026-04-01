
import React, { useState } from "react";
import "./Results.css";

const Results: React.FC = () => {
  const [openLifestyle, setOpenLifestyle] = useState<string | null>(null);
  const [openSound, setOpenSound] = useState<string | null>(null);

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

      {/* PROFILE */}
      <div
        className="dt-row dt-main"
        onClick={() =>
          setOpenLifestyle(openLifestyle === "profile" ? null : "profile")
        }
      >
        <div>{openLifestyle === "profile" ? "▼" : "▶"}</div>
        <div>Profile</div>
        <div></div>
        <div></div>
      </div>

      {openLifestyle === "profile" && (
        <>
          <div className="dt-row dt-alt">
            <div></div>
            <div></div>
            <div>Dona Jona</div>
            <div>First time user</div>
          </div>
          <div className="dt-row dt-alt">
            <div></div>
            <div></div>
            <div>Email</div>
            <div>jondoe@email.com</div>
          </div>
        </>
      )}

      {/* GETTING TO KNOW YOU */}
      <div
        className="dt-row dt-main"
        onClick={() =>
          setOpenLifestyle(openLifestyle === "know" ? null : "know")
        }
      >
        <div>{openLifestyle === "know" ? "▼" : "▶"}</div>
        <div>Getting to know you better</div>
        <div></div>
        <div></div>
      </div>

      {openLifestyle === "know" && (
        <>
          <div className="dt-row dt-alt">
            <div></div>
            <div></div>
            <div>Family history of hearing loss</div>
            <div>No</div>
          </div>
          <div className="dt-row dt-alt">
            <div></div>
            <div></div>
            <div>Long-term noise exposure</div>
            <div>Yes</div>
          </div>
        </>
      )}

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
