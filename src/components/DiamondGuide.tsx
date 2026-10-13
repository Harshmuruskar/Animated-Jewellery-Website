import { useState } from "react";
import { ArrowUpRight, Diamond, Ruler } from "lucide-react";
import {
  caratDiameter,
  clarityGrades,
  colorGrades,
  cutGrades,
  ringSizes,
} from "@/lib/jewelry-data";
import { useCartStore } from "@/hooks/use-cart-store";

const topics = ["Carat", "Color", "Clarity", "Cut", "Ring size"] as const;
type Topic = (typeof topics)[number];
export function DiamondGuide() {
  const [topic, setTopic] = useState<Topic>("Carat");
  const [carat, setCarat] = useState(2);
  const [color, setColor] = useState(0);
  const [clarity, setClarity] = useState(0);
  const [cut, setCut] = useState(0);
  const [size, setSize] = useState("7");
  const [system, setSystem] = useState<"us" | "uk" | "eu" | "jp">("us");
  const selectedSize = ringSizes.find((item) => item.us === size)!;
  const cart = useCartStore();
  return (
    <section
      id="diamond-guide"
      className="flagship-section diamond-section"
      aria-labelledby="diamond-title"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">03 / A little knowledge. A lifetime of beauty.</span>
          <h2 id="diamond-title">
            Find your <em>brilliance.</em>
          </h2>
        </div>
        <p>
          Explore the four qualities of a diamond.
          <br />
          Then discover a fit that feels like you.
        </p>
      </div>
      <div className="diamond-studio">
        <div className="studio-navigation" role="group" aria-label="Diamond studio topics">
          {topics.map((item, index) => (
            <button aria-pressed={topic === item} key={item} onClick={() => setTopic(item)}>
              <span>0{index + 1}</span>
              {item}
              {item === "Ring size" ? (
                <Ruler size={18} strokeWidth={1} />
              ) : (
                <Diamond size={18} strokeWidth={1} />
              )}
            </button>
          ))}
        </div>
        <div className="studio-workspace">
          {topic === "Carat" && (
            <>
              <div className="stone-comparison">
                <div className="finger-scale">
                  <div className="finger-band" />
                  <div
                    className="brilliant-stone"
                    style={{
                      width: `${caratDiameter(carat) * 10}px`,
                      height: `${caratDiameter(carat) * 10}px`,
                    }}
                  >
                    <Diamond size="70%" strokeWidth={0.6} />
                  </div>
                </div>
                <span className="measurement-rule">
                  ≈ {caratDiameter(carat).toFixed(1)} mm diameter
                </span>
                <small>Round brilliant · visual comparison only</small>
              </div>
              <div className="studio-controls">
                <span className="eyebrow">Weight, with presence</span>
                <h3>
                  {carat.toFixed(2)} <em>carats</em>
                </h3>
                <p>
                  Carat describes weight, rather than size. Cut and proportions determine how large
                  a diamond appears.
                </p>
                <label className="field-label" htmlFor="carat-slider">
                  Explore carat weight
                </label>
                <input
                  id="carat-slider"
                  type="range"
                  min="0.75"
                  max="5"
                  step="0.05"
                  value={carat}
                  aria-valuetext={`${carat.toFixed(2)} carats, approximately ${caratDiameter(carat).toFixed(1)} millimeters`}
                  onChange={(event) => setCarat(Number(event.target.value))}
                />
                <div className="range-labels">
                  <span>0.75 ct</span>
                  <span>5.00 ct</span>
                </div>
                <p className="studio-note">
                  Diameters are approximate and vary with proportions. This illustration is not
                  life-size.
                </p>
              </div>
            </>
          )}
          {topic === "Color" && (
            <>
              <div className="grade-visual">
                <div className="brilliant-stone" style={{ background: colorGrades[color]!.color }}>
                  <Diamond size={110} strokeWidth={0.5} />
                </div>
                <span>{colorGrades[color]!.grade}</span>
                <small>Illustration exaggerates color differences.</small>
              </div>
              <div className="studio-controls">
                <span className="eyebrow">The beauty of a whisper</span>
                <h3>{colorGrades[color]!.label}</h3>
                <p>
                  The GIA D-to-Z scale describes the absence of color. D–F are colorless; G–J are
                  near colorless.
                </p>
                <div className="grade-options" role="group" aria-label="Select diamond color">
                  {colorGrades.map((item, index) => (
                    <button
                      key={item.grade}
                      aria-pressed={color === index}
                      onClick={() => setColor(index)}
                      style={{ borderBottomColor: item.color }}
                    >
                      {item.grade}
                    </button>
                  ))}
                </div>
                <p className="studio-note">
                  Fancy-color diamonds, including Fancy Vivid, use a separate color grading system.
                </p>
              </div>
            </>
          )}
          {topic === "Clarity" && (
            <>
              <div className="grade-visual">
                <div className="clarity-stone">
                  <Diamond size={150} strokeWidth={0.5} />
                  {Array.from({ length: clarity * 2 }, (_, index) => (
                    <i
                      key={index}
                      style={{
                        left: `${25 + ((index * 17) % 50)}%`,
                        top: `${25 + ((index * 13) % 50)}%`,
                      }}
                    />
                  ))}
                </div>
                <span>{clarityGrades[clarity]!.grade}</span>
                <small>Illustrative inclusions · magnified view</small>
              </div>
              <div className="studio-controls">
                <span className="eyebrow">The character within</span>
                <h3>{clarityGrades[clarity]!.label}</h3>
                <p>{clarityGrades[clarity]!.detail}</p>
                <div className="grade-options" role="group" aria-label="Select diamond clarity">
                  {clarityGrades.map((item, index) => (
                    <button
                      key={item.grade}
                      aria-pressed={clarity === index}
                      onClick={() => setClarity(index)}
                    >
                      {item.grade}
                    </button>
                  ))}
                </div>
                <p className="studio-note">
                  Clarity considers the size, nature, position and visibility of a diamond’s
                  characteristics.
                </p>
              </div>
            </>
          )}
          {topic === "Cut" && (
            <>
              <div className="grade-visual">
                <div className="cut-rays" style={{ opacity: cutGrades[cut]!.brilliance }}>
                  <Diamond size={150} strokeWidth={0.5} />
                  <span aria-hidden="true">✧</span>
                </div>
                <small>Light-return illustration</small>
              </div>
              <div className="studio-controls">
                <span className="eyebrow">A conversation with light</span>
                <h3>{cutGrades[cut]!.grade}</h3>
                <p>{cutGrades[cut]!.detail}</p>
                <div
                  className="grade-options cut-options"
                  role="group"
                  aria-label="Select diamond cut"
                >
                  {cutGrades.map((item, index) => (
                    <button
                      key={item.grade}
                      aria-pressed={cut === index}
                      onClick={() => setCut(index)}
                    >
                      {item.grade}
                    </button>
                  ))}
                </div>
                <p className="studio-note">
                  GIA’s overall cut grade applies to standard round brilliant diamonds in the D-to-Z
                  color range.
                </p>
              </div>
            </>
          )}
          {topic === "Ring size" && (
            <>
              <div className="grade-visual ring-measurement">
                <div
                  className="sizing-ring"
                  style={{ width: selectedSize.diameter * 7, height: selectedSize.diameter * 7 }}
                />
                <span>
                  {selectedSize.diameter.toFixed(1)} <small>mm</small>
                </span>
                <small>Inner diameter · diagram is not life-size</small>
              </div>
              <div className="studio-controls">
                <span className="eyebrow">Made for your hand</span>
                <h3>The perfect fit.</h3>
                <div className="sizer-inputs">
                  <label className="field-label">
                    Sizing system
                    <select
                      aria-label="Sizing system"
                      value={system}
                      onChange={(event) => setSystem(event.target.value as typeof system)}
                    >
                      <option value="us">US / Canada</option>
                      <option value="uk">UK</option>
                      <option value="eu">EU circumference</option>
                      <option value="jp">Japan</option>
                    </select>
                  </label>
                  <label className="field-label">
                    Ring size
                    <select
                      aria-label="Ring size"
                      value={size}
                      onChange={(event) => setSize(event.target.value)}
                    >
                      {ringSizes.map((item) => (
                        <option key={item.us} value={item.us}>
                          {item[system]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <dl className="size-conversions">
                  <div>
                    <dt>US</dt>
                    <dd>{selectedSize.us}</dd>
                  </div>
                  <div>
                    <dt>UK</dt>
                    <dd>{selectedSize.uk}</dd>
                  </div>
                  <div>
                    <dt>EU</dt>
                    <dd>{selectedSize.eu}</dd>
                  </div>
                  <div>
                    <dt>JP</dt>
                    <dd>{selectedSize.jp}</dd>
                  </div>
                </dl>
                <p className="studio-note">
                  For an estimate at home, measure the inside diameter of a well-fitting ring. A
                  jeweler’s finger gauges give the most accurate fit; international equivalents are
                  approximate.
                </p>
              </div>
            </>
          )}
        </div>
        <div className="studio-bottom">
          <a
            href={
              topic === "Ring size"
                ? "https://4cs.gia.edu/en-us/blog/how-to-determine-ring-size-tips-and-ring-size-chart/"
                : "https://4cs.gia.edu/en-us/4cs-of-diamond-quality/"
            }
            target="_blank"
            rel="noreferrer"
          >
            Explore the GIA guide <ArrowUpRight size={14} />
          </a>
          <button className="text-link" onClick={() => cart.setConciergeOpen(true)}>
            Let us guide you <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
