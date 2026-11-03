import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { accidentalGlyph } from "@/lib/intervals/catalog";
import { Major, Minor } from "@/components/quality-text";
import { cn } from "@/lib/utils";

export type NotesPractice = "intervals" | "inversions" | "scales" | "keys" | "scale-lesson";

type Step = { title: ReactNode; body: ReactNode };

type Lesson = {
  id: string;
  name: string;
  hint: ReactNode;
  steps: Step[];
  practice?: NotesPractice;
  practiceLabel?: string;
};

function Q({ kind, degree }: { kind: "M" | "m" | "P"; degree: string }) {
  return (
    <span className={cn("font-semibold tabular-nums", kind === "M" && "text-major", kind === "m" && "text-minor")}>
      {kind}
      {degree}
    </span>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-base leading-relaxed">{children}</p>;
}

function Watch({ children }: { children: ReactNode }) {
  return <div className="mt-3 rounded-lg bg-secondary px-3 py-2 text-base leading-relaxed">{children}</div>;
}

function NoteChip({
  letter,
  accidental = 0,
  role = "mid",
}: {
  letter: string;
  accidental?: number;
  role?: "start" | "goal" | "mid";
}) {
  return (
    <span
      className={cn(
        "inline-flex h-11 min-w-10 items-center justify-center rounded-md px-1.5 text-base font-medium",
        role === "goal" && "bg-primary text-primary-foreground",
        role === "start" && "bg-highlight text-highlight-foreground",
        role === "mid" && "bg-secondary",
      )}
    >
      {letter}
      {accidentalGlyph(accidental)}
    </span>
  );
}

function Path({ notes }: { notes: { letter: string; accidental?: number; role?: "start" | "goal" | "mid" }[] }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-y-2 py-1">
      {notes.map((note, index) => (
        <div key={`${note.letter}${note.accidental ?? 0}-${index}`} className="flex items-center">
          <NoteChip letter={note.letter} accidental={note.accidental ?? 0} role={note.role ?? "mid"} />
          {index < notes.length - 1 ? (
            <span className="w-5 text-center text-xs tabular-nums text-muted-foreground">{index + 1}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function Houses() {
  return (
    <div className="mt-3 grid grid-cols-4 gap-2">
      {["C", "D", "E", "F"].map((letter, index) => (
        <div key={letter} className="flex flex-col items-center rounded-lg bg-secondary py-2">
          <span className="text-xs tabular-nums text-muted-foreground">{index + 1}</span>
          <span className="font-display text-lg">{letter}</span>
        </div>
      ))}
    </div>
  );
}

function ScaleSteps({ pattern }: { pattern: ("W" | "H")[] }) {
  return (
    <div className="mt-3 flex justify-between gap-1">
      {pattern.map((kind, index) => (
        <div key={`${kind}-${index}`} className="flex flex-col items-center gap-1">
          <span className="flex h-7 items-end">
            <span className={cn("bg-foreground", kind === "W" ? "size-7 rounded-full" : "h-3.5 w-7 rounded-t-full")} />
          </span>
          <span className="text-xs font-medium">{kind === "W" ? "W" : "h"}</span>
        </div>
      ))}
    </div>
  );
}

const MAJOR_STEPS: ("W" | "H")[] = ["W", "W", "H", "W", "W", "W", "H"];
const MINOR_STEPS: ("W" | "H")[] = ["W", "H", "W", "W", "H", "W", "W"];

function IntervalLine({ steps, name, short }: { steps: number; name: ReactNode; short: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border py-1.5 text-base last:border-0">
      <span className="w-6 tabular-nums text-muted-foreground">{steps}</span>
      <span className="flex-1">{name}</span>
      <span>{short}</span>
    </div>
  );
}

function DegreeTable() {
  const rows: { d: string; major: "M" | "m" | "P"; natural: "M" | "m" | "P"; harmonic: "M" | "m" | "P" }[] = [
    { d: "1", major: "P", natural: "P", harmonic: "P" },
    { d: "2", major: "M", natural: "M", harmonic: "M" },
    { d: "3", major: "M", natural: "m", harmonic: "m" },
    { d: "4", major: "P", natural: "P", harmonic: "P" },
    { d: "5", major: "P", natural: "P", harmonic: "P" },
    { d: "6", major: "M", natural: "m", harmonic: "m" },
    { d: "7", major: "M", natural: "m", harmonic: "M" },
    { d: "8", major: "P", natural: "P", harmonic: "P" },
  ];
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-border">
      <div className="grid grid-cols-4 bg-secondary px-2 py-2 text-[10px] font-medium">
        <span />
        <span className="text-center text-major">MAJOR</span>
        <span className="text-center text-minor">natural</span>
        <span className="text-center text-minor">harmonic</span>
      </div>
      {rows.map((row) => (
        <div key={row.d} className="grid grid-cols-4 px-2 py-1.5 text-center text-sm">
          <span className="text-left text-muted-foreground">{row.d}</span>
          <Q kind={row.major} degree={row.d} />
          <Q kind={row.natural} degree={row.d} />
          <Q kind={row.harmonic} degree={row.d} />
        </div>
      ))}
    </div>
  );
}

function ChordLine({
  num,
  name,
  tone,
}: {
  num: string;
  name: string;
  tone: "M" | "m" | "d";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1 text-base">
      <span className={cn("w-10 font-semibold", tone === "M" && "text-major", tone === "m" && "text-minor")}>{num}</span>
      <span className="flex-1 font-medium">{name}</span>
      <span className={cn("text-sm font-semibold", tone === "M" && "text-major", tone === "m" && "text-minor")}>
        {tone === "M" ? "MAJOR" : tone === "m" ? "minor" : "diminished"}
      </span>
    </div>
  );
}

const LESSONS: Lesson[] = [
  {
    id: "count",
    name: "Two ways to count",
    hint: "Letters are houses. Half-steps are moves.",
    practice: "intervals",
    practiceLabel: "Practice intervals",
    steps: [
      {
        title: "An interval is a measurement.",
        body: (
          <>
            <P>You can enjoy music without defining it. To play it or write it, you need the measurement between two notes.</P>
            <P>That measurement is an interval. Everything else in these notes hangs off that.</P>
          </>
        ),
      },
      {
        title: "The number and the quality are different counts.",
        body: (
          <>
            <P>The number (2nd, 3rd, 5th) only picks a letter. The quality tells you how many half-steps that letter sits away.</P>
            <P>
              <Major /> is red. <Minor /> is blue. They are qualities, not the number.
            </P>
          </>
        ),
      },
      {
        title: "Count the number like houses.",
        body: (
          <>
            <P>The note you are on is house 1. You count it. C to E is C = 1, D = 2, E = 3. That is a 3rd.</P>
            <Houses />
            <P>F would be the 4th house. The number still says nothing about sharps or flats.</P>
          </>
        ),
      },
      {
        title: "Count half-steps like a move.",
        body: (
          <>
            <P>Piano keys, frets, semitones. Do not count the note you are already on. The first move is 1.</P>
            <Path
              notes={[
                { letter: "C", role: "start" },
                { letter: "C", accidental: 1 },
                { letter: "D" },
                { letter: "D", accidental: 1 },
                { letter: "E", role: "goal" },
              ]}
            />
            <P>C to E is 4 half-steps. The number under each hop is the move, not the house.</P>
          </>
        ),
      },
      {
        title: "Put the two counts together.",
        body: (
          <>
            <P>Same two notes. The houses say 3rd. The moves say 4 half-steps.</P>
            <P>
              A 3rd that is 4 half-steps is a <Major /> 3rd. A 3rd that is 3 half-steps is E♭, a <Minor /> 3rd.
            </P>
            <P>If someone says “up a 3rd” and you count D as 1, you will land on the wrong letter. Start on the note you are on.</P>
          </>
        ),
      },
    ],
  },
  {
    id: "map",
    name: "The interval map",
    hint: "Twelve half-steps, and the family each one belongs to.",
    practice: "intervals",
    practiceLabel: "Practice intervals",
    steps: [
      {
        title: "2nds.",
        body: (
          <>
            <P>
              One half-step is a <Minor /> 2nd. Two is a <Major /> 2nd. Same letter span, different distance.
            </P>
            <IntervalLine steps={1} name={<><Minor /> 2nd</>} short={<Q kind="m" degree="2" />} />
            <IntervalLine steps={2} name={<><Major /> 2nd</>} short={<Q kind="M" degree="2" />} />
          </>
        ),
      },
      {
        title: "3rds.",
        body: (
          <>
            <IntervalLine steps={3} name={<><Minor /> 3rd</>} short={<Q kind="m" degree="3" />} />
            <IntervalLine steps={4} name={<><Major /> 3rd</>} short={<Q kind="M" degree="3" />} />
            <P>
              These two build almost every chord. The 3rd decides <Major /> or <Minor />.
            </P>
          </>
        ),
      },
      {
        title: "The perfect 4th is 5 half-steps.",
        body: (
          <>
            <IntervalLine steps={5} name="Perfect 4th" short={<Q kind="P" degree="4" />} />
            <P>
              Four letter names, counting the one you are on. C D E F. It is not a <Major /> interval and not a <Minor /> interval. 4ths live in the perfect family.
            </P>
            <Watch>
              It is not always perfect. In C <Major />, F up to B is 6 half-steps. That is an augmented 4th, one of the two names for the tritone.
            </Watch>
          </>
        ),
      },
      {
        title: "The perfect 5th is 7 half-steps.",
        body: (
          <>
            <IntervalLine steps={7} name="Perfect 5th" short={<Q kind="P" degree="5" />} />
            <P>Also the perfect family. Shrink it by one half-step and you get a diminished 5th: 6 half-steps, the other name for the tritone.</P>
            <IntervalLine steps={6} name="Tritone · aug 4th or dim 5th" short="TT" />
            <P>From C, the diminished 5th is G♭. Spell it as a 5th, not as F♯. F♯ would be a 4th.</P>
          </>
        ),
      },
      {
        title: "6ths and 7ths.",
        body: (
          <>
            <IntervalLine steps={8} name={<><Minor /> 6th</>} short={<Q kind="m" degree="6" />} />
            <IntervalLine steps={9} name={<><Major /> 6th</>} short={<Q kind="M" degree="6" />} />
            <IntervalLine steps={10} name={<><Minor /> 7th</>} short={<Q kind="m" degree="7" />} />
            <IntervalLine steps={11} name={<><Major /> 7th</>} short={<Q kind="M" degree="7" />} />
          </>
        ),
      },
      {
        title: "The octave is 12.",
        body: (
          <>
            <IntervalLine steps={12} name="Perfect octave" short={<Q kind="P" degree="8" />} />
            <P>
              Same letter as the root, up or down. Perfect. Not <Major />, not <Minor />.
            </P>
            <P>Up and down between the same two letters add to 12. That is the next lesson’s whole trick, after the shortcuts.</P>
          </>
        ),
      },
    ],
  },
  {
    id: "shortcuts",
    name: "Shortcuts",
    hint: (
      <>
        Park on a <Major /> 3rd or a perfect 5th, then step off it.
      </>
    ),
    practice: "intervals",
    practiceLabel: "Practice intervals",
    steps: [
      {
        title: "You don’t memorize all 12 from zero.",
        body: (
          <P>
            If you can find a <Major /> 3rd, or a perfect 5th, the neighbors are one or two half-steps away.
          </P>
        ),
      },
      {
        title: (
          <>
            From a <Major /> 3rd.
          </>
        ),
        body: (
          <>
            <P>
              A <Major /> 3rd is 4 half-steps. One more half-step up is a perfect 4th. One half-step down is a <Minor /> 3rd.
            </P>
            <P>
              <Major /> 3rd + 1 = perfect 4th.
              <br />
              <Major /> 3rd − 1 = <Minor /> 3rd.
            </P>
          </>
        ),
      },
      {
        title: (
          <>
            From C, the <Major /> 3rd is E.
          </>
        ),
        body: (
          <>
            <Path
              notes={[
                { letter: "C", role: "start" },
                { letter: "C", accidental: 1 },
                { letter: "D" },
                { letter: "D", accidental: 1 },
                { letter: "E", role: "goal" },
              ]}
            />
            <P>Up one more half-step from E is F. That is the perfect 4th. You did not have to restart the count from C.</P>
            <P>
              Down one half-step from E is E♭. That is the <Minor /> 3rd. Same letter, one closer.
            </P>
          </>
        ),
      },
      {
        title: "From a perfect 5th.",
        body: (
          <>
            <P>A perfect 5th is 7 half-steps. From C, that is G. Then:</P>
            <P>
              + 2 half-steps = <Major /> 6th
              <br />+ 1 = <Minor /> 6th
              <br />− 1 = diminished 5th
              <br />− 2 = perfect 4th
            </P>
            <P>
              From G: A is the <Major /> 6th. F is the perfect 4th, the same F you found off E.
            </P>
            <Watch>
              The half-steps give the distance. The interval number still picks the letter. A <Minor /> 6th above C is A♭, not G♯. A diminished 5th is G♭, not F♯.
            </Watch>
          </>
        ),
      },
    ],
  },
  {
    id: "scales",
    name: "Scale steps",
    hint: (
      <>
        <Major />, natural <Minor />, then the raised 7th.
      </>
    ),
    practice: "scale-lesson",
    practiceLabel: "Build them from C",
    steps: [
      {
        title: (
          <>
            A <Major /> scale is whole, whole, half, whole, whole, whole, half.
          </>
        ),
        body: (
          <>
            <ScaleSteps pattern={MAJOR_STEPS} />
            <P>A filled circle is a whole step. A half circle is a half-step. Two half-steps make one whole step.</P>
          </>
        ),
      },
      {
        title: "Willy Wagers Half While Wally Whistles Happily.",
        body: (
          <>
            <P>The first letter of each word is the step: W W h W W W h.</P>
            <P>
              Wagers rhymes with <Major />. That is how you know this sentence belongs to the <Major /> scale, not the <Minor /> one.
            </P>
          </>
        ),
      },
      {
        title: "From C, the half-steps are the white-key pairs.",
        body: (
          <>
            <P>C D E F G A B C. The half-steps land on E–F and B–C. No black key sits between those pairs, so nothing has to move.</P>
            <P>
              The qualities, in order: <Q kind="P" degree="1" /> <Q kind="M" degree="2" /> <Q kind="M" degree="3" /> <Q kind="P" degree="4" />{" "}
              <Q kind="P" degree="5" /> <Q kind="M" degree="6" /> <Q kind="M" degree="7" /> <Q kind="P" degree="8" />.
            </P>
          </>
        ),
      },
      {
        title: (
          <>
            Natural <Minor /> is a different pattern.
          </>
        ),
        body: (
          <>
            <P>Whole, half, whole, whole, half, whole, whole.</P>
            <ScaleSteps pattern={MINOR_STEPS} />
            <P>
              From A, the relative <Minor /> of C: A B C D E F G A. Same notes as C <Major />. New starting note.
            </P>
            <P>
              When someone says “the <Minor /> scale” and stops there, this is the one they mean. The 3rd, 6th, and 7th are <Minor />.
            </P>
          </>
        ),
      },
      {
        title: (
          <>
            Harmonic <Minor /> raises the 7th.
          </>
        ),
        body: (
          <>
            <P>
              One note changes. In A harmonic <Minor /> the 7th is G♯, not G. The 7th becomes a <Major /> 7th. The 3rd and 6th stay <Minor />.
            </P>
            <P>A B C D E F G♯ A. The gap from F to G♯ is 3 half-steps, which is why it sounds sharper than natural <Minor />.</P>
            <Watch>
              Harmonic <Minor /> does not share every note with the relative <Major />. Natural <Minor /> does. Don’t swap those two names.
            </Watch>
          </>
        ),
      },
      {
        title: "The three patterns, degree by degree.",
        body: (
          <>
            <P>
              Red <Q kind="M" degree="" /> means <Major />. Blue <Q kind="m" degree="" /> means <Minor />. P is perfect, neither one.
            </P>
            <DegreeTable />
            <P>The only difference between natural and harmonic <Minor /> on this table is the 7th.</P>
          </>
        ),
      },
      {
        title: "The 3rd decides the mode’s family.",
        body: (
          <>
            <P>
              A mode with a <Major /> 3rd is in the <Major /> family: Ionian, Lydian, Mixolydian. A mode with a <Minor /> 3rd is in the <Minor /> family: Dorian, Phrygian, Aeolian, Locrian.
            </P>
            <P>
              E Lydian is the 4th mode of B <Major />. Same notes, starting on E: E F♯ G♯ A♯ B C♯ D♯. The A♯ is the raised 4th. E <Major /> would have used A.
            </P>
            <P>
              E Mixolydian is the 5th mode of A <Major />: E F♯ G♯ A B C♯ D. The 7th is D, not D♯.
            </P>
          </>
        ),
      },
    ],
  },
  {
    id: "flip",
    name: "Flip an interval",
    hint: "Up and down add to an octave. The names flip.",
    practice: "inversions",
    practiceLabel: "Practice inversions",
    steps: [
      {
        title: "Up and down are not the same interval.",
        body: (
          <P>
            From C you can reach E by going up, or by going down the other way. Those are different intervals. Add them and you get 12 half-steps. An octave.
          </P>
        ),
      },
      {
        title: "C up to E, and C down to E.",
        body: (
          <>
            <P>
              Up is a <Major /> 3rd. 4 half-steps.
            </P>
            <Path
              notes={[
                { letter: "C", role: "start" },
                { letter: "C", accidental: 1 },
                { letter: "D" },
                { letter: "D", accidental: 1 },
                { letter: "E", role: "goal" },
              ]}
            />
            <P>
              Down is a <Minor /> 6th. 8 half-steps. C B B♭ A A♭ G G♭ F E.
            </P>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-secondary px-1 py-2">
                <div className="font-display text-2xl text-major">4</div>
                <div className="text-[10px] leading-tight">
                  <Major /> 3rd
                </div>
              </div>
              <div className="rounded-lg bg-secondary px-1 py-2">
                <div className="font-display text-2xl text-minor">8</div>
                <div className="text-[10px] leading-tight">
                  <Minor /> 6th
                </div>
              </div>
              <div className="rounded-lg bg-secondary px-1 py-2">
                <div className="font-display text-2xl">12</div>
                <div className="text-[10px] leading-tight">octave</div>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "The quality flips.",
        body: (
          <>
            <P>
              <Major /> becomes <Minor />. <Minor /> becomes <Major />. Augmented becomes diminished. Diminished becomes augmented. Perfect stays perfect.
            </P>
            <div className="mt-3 flex flex-col gap-1 text-sm">
              <p>
                <Major /> → <Minor />
              </p>
              <p>
                <Minor /> → <Major />
              </p>
              <p>Perfect → Perfect</p>
              <p>Augmented → diminished</p>
              <p>diminished → Augmented</p>
            </div>
          </>
        ),
      },
      {
        title: "The number flips so the two numbers add to 9.",
        body: (
          <>
            <P>A 2nd inverts to a 7th. A 3rd to a 6th. A 4th to a 5th. A unison to an octave. 2 + 7 = 9. 4 + 5 = 9.</P>
            <div className="mt-3 grid grid-cols-2 gap-x-6 text-sm tabular-nums">
              {["1 = 8", "2 = 7", "3 = 6", "4 = 5", "5 = 4", "6 = 3", "7 = 2", "8 = 1"].map((pair) => (
                <p key={pair}>{pair}</p>
              ))}
            </div>
            <P>
              A <Major /> 3rd inverts to a <Minor /> 6th. That is the C–E example. Both rules at once.
            </P>
          </>
        ),
      },
      {
        title: "Why this matters.",
        body: (
          <>
            <P>Turn a chord over and the interval between the same two notes flips.</P>
            <P>
              C up to E is a <Major /> 3rd. Put E in the bass and E up to C is a <Minor /> 6th. The chord is still C <Major />. You inverted the interval. You did not change the chord.
            </P>
          </>
        ),
      },
      {
        title: "A triad, read from the bass.",
        body: (
          <>
            <P>Line the chord up and keep going: R, 3, 5, then the next R and 3. Whichever three you read in a row is an inversion.</P>
            <div className="mt-3 flex flex-col gap-2">
              {[
                ["Root", "R", "3", "5"],
                ["1st inversion", "3", "5", "R"],
                ["2nd inversion", "5", "R", "3"],
              ].map(([label, a, b, c]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-24 text-xs text-muted-foreground">{label}</span>
                  {[a, b, c].map((cell, index) => (
                    <span key={`${label}-${index}`} className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-sm font-medium">
                      {cell}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <P>Root is R–3–5. 1st inversion is 3–5–R. 2nd inversion is 5–R–3.</P>
          </>
        ),
      },
    ],
  },
  {
    id: "diatonic",
    name: "Chords in a key",
    hint: (
      <>
        One, four, and five are <Major />. Six is the relative <Minor />.
      </>
    ),
    steps: [
      {
        title: (
          <>
            A <Major /> key uses seven chords, in a fixed order.
          </>
        ),
        body: (
          <>
            <p className="mt-2 text-lg font-semibold tracking-wide">
              <span className="text-major">I</span> <span className="text-minor">ii</span> <span className="text-minor">iii</span>{" "}
              <span className="text-major">IV</span> <span className="text-major">V</span> <span className="text-minor">vi</span> vii°
            </p>
            <P>
              One, four, and five are <Major />. Two, three, and six are <Minor />. Seven is diminished.
            </P>
          </>
        ),
      },
      {
        title: (
          <>
            Six is the relative <Minor /> chord.
          </>
        ),
        body: (
          <P>
            The vi chord is built on scale degree 6. In C <Major />, that is A <Minor />. Same notes as the key, starting on 6. Not a new key signature.
          </P>
        ),
      },
      {
        title: (
          <>
            C <Major />, written out.
          </>
        ),
        body: (
          <div className="mt-2">
            <ChordLine num="I" name="C" tone="M" />
            <ChordLine num="ii" name="Dm" tone="m" />
            <ChordLine num="iii" name="Em" tone="m" />
            <ChordLine num="IV" name="F" tone="M" />
            <ChordLine num="V" name="G" tone="M" />
            <ChordLine num="vi" name="Am" tone="m" />
            <ChordLine num="vii°" name="B°" tone="d" />
          </div>
        ),
      },
      {
        title: (
          <>
            G <Major />.
          </>
        ),
        body: (
          <>
            <P>Same order. The key has one sharp, F♯, and it shows up inside the chords that need it.</P>
            <div className="mt-2">
              <ChordLine num="I" name="G · G B D" tone="M" />
              <ChordLine num="ii" name="Am · A C E" tone="m" />
              <ChordLine num="iii" name="Bm · B D F♯" tone="m" />
              <ChordLine num="IV" name="C" tone="M" />
              <ChordLine num="V" name="D" tone="M" />
              <ChordLine num="vi" name="Em" tone="m" />
              <ChordLine num="vii°" name="F♯°" tone="d" />
            </div>
          </>
        ),
      },
      {
        title: (
          <>
            Natural <Minor /> has its own order.
          </>
        ),
        body: (
          <>
            <p className="mt-2 text-lg font-semibold tracking-wide">
              <span className="text-minor">i</span> ii° <span className="text-major">III</span> <span className="text-minor">iv</span>{" "}
              <span className="text-minor">v</span> <span className="text-major">VI</span> <span className="text-major">VII</span>
            </p>
            <P>In A natural <Minor />: Am, B°, C, Dm, Em, F, G. Same chords as C <Major />, starting on Am.</P>
          </>
        ),
      },
      {
        title: (
          <>
            Harmonic <Minor /> changes the five-chord.
          </>
        ),
        body: (
          <P>
            Raise the 7th and v becomes <Major />. In A harmonic <Minor /> the five-chord is E <Major /> (E G♯ B), not Em. The seven-chord becomes diminished, G♯°. That <Major /> V is the one people mean by “the five chord in <Minor />.”
          </P>
        ),
      },
    ],
  },
  {
    id: "find-key",
    name: "Find the key",
    hint: "Shortcuts for a progression that stays in one key.",
    steps: [
      {
        title: "These are shortcuts, not laws.",
        body: (
          <P>
            They work when the chords belong to one key. If a chord comes in from outside, the shortcut can point at the wrong tonic. Use it to make a shortlist, then check the list against the chords.
          </P>
        ),
      },
      {
        title: "A diminished chord is usually one half-step under the tonic.",
        body: (
          <>
            <P>
              In a <Major /> key, the only diminished triad is vii°. Go up one half-step and one letter. B° points at C.
            </P>
            <Watch>
              It is not the only diminished chord in music. Natural <Minor /> has one on ii° as well. B° is also ii° of A <Minor />. If the other chords look like the <Minor /> family, check that relative <Minor /> before you lock it.
            </Watch>
          </>
        ),
      },
      {
        title: (
          <>
            Two <Major /> chords a whole step apart.
          </>
        ),
        body: (
          <>
            <P>
              In a <Major /> key, the only <Major /> chords a whole step apart are IV and V. The higher one is V.
            </P>
            <P>The tonic is a perfect 5th below V. That is 7 half-steps down, and 5 letter names, counting the letter you are on.</P>
            <Watch>
              Not 5 whole steps. Five whole steps down from G lands on A. From G, count the letters G F E D C. The tonic is C.
            </Watch>
            <P>
              This is the <Major />-key reading. In natural <Minor />, two <Major /> chords a whole step apart are VI and VII, and the higher one is not V.
            </P>
            <P>Going up a perfect 5th, the accidental usually stays. It changes off a B: B goes to F♯, B♭ goes to F. Going down, it changes off an F: F goes to B♭.</P>
          </>
        ),
      },
      {
        title: (
          <>
            Two <Minor /> chords a whole step apart.
          </>
        ),
        body: (
          <>
            <P>
              In a <Major /> key those are ii and iii. The lower one is ii. The tonic is a whole step down, one letter down, and the accidental stays. D → C. F♯ → E. B♭ → A♭.
            </P>
            <P>
              Take Em, F, Dm. The <Minor /> pair a whole step apart is Dm and Em, and Dm is the lower one, so ii is Dm. One letter down is C.
            </P>
            <P>
              A <Minor /> uses Dm and Em too, as iv and v. The shortcut names the <Major /> tonic. If the progression sits on Am instead, that is the relative <Minor /> of the same signature.
            </P>
          </>
        ),
      },
      {
        title: (
          <>
            <Minor /> ii, then a <Major /> chord a 5th higher.
          </>
        ),
        body: (
          <P>
            Dm up to G. G is a perfect 5th above D, so in a <Major /> key this is ii going to V. The tonic is a perfect 5th under that <Major /> chord: C. If G resolves to Am instead, those same chords are VII going to i in A <Minor />.
          </P>
        ),
      },
      {
        title: (
          <>
            A <Minor /> chord a half-step under a <Major /> chord.
          </>
        ),
        body: (
          <>
            <P>
              Em up to F. In a <Major /> key that pair is iii going to IV, so the <Major /> chord is IV and a perfect 4th down is the tonic. In natural <Minor /> the same two chords are v going to VI.
            </P>
            <P>
              Em, F, and Dm all live in C <Major />: iii, IV, ii. They also all live in A natural <Minor />: v, VI, iv. The shortcuts found the family. Whichever chord feels like home is the tonic.
            </P>
          </>
        ),
      },
    ],
  },
  {
    id: "sharps",
    name: "Order of sharps",
    hint: "The order never changes. The count goes up by fifths.",
    practice: "keys",
    practiceLabel: "Practice keys",
    steps: [
      {
        title: "Sharps are added in one order.",
        body: (
          <>
            <p className="mt-2 font-display text-2xl tracking-tight">F C G D A E B</p>
            <P>Father Charles Goes Down And Ends Battle. Same sentence as the key flashcards.</P>
          </>
        ),
      },
      {
        title: "Each key a 5th higher adds the next sharp.",
        body: (
          <>
            <div className="mt-2">
              {[
                ["C", "0"],
                ["G", "1"],
                ["D", "2"],
                ["A", "3"],
                ["E", "4"],
                ["B", "5"],
                ["F♯", "6"],
                ["C♯", "7"],
              ].map(([key, count]) => (
                <div key={key} className="flex justify-between border-b border-border py-1.5 text-sm last:border-0">
                  <span className="font-medium">{key}</span>
                  <span className="tabular-nums text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
            <P>God Does An Excellent Back Flip Carefully starts at G. C is left off on purpose. Zero sharps is not a thing you recite.</P>
          </>
        ),
      },
      {
        title: (
          <>
            D <Major /> has two sharps.
          </>
        ),
        body: (
          <>
            <P>Write the letters from D, then sharpen the first two names in the order: F and C.</P>
            <p className="mt-3 font-display text-xl tracking-tight">D E F♯ G A B C♯</p>
            <P>The letters were already there. The sharps only move F and C.</P>
          </>
        ),
      },
      {
        title: (
          <>
            The <Minor /> under a <Major /> key is the relative <Minor />.
          </>
        ),
        body: (
          <>
            <P>
              Down 3 half-steps from the <Major /> tonic. C down to A. Same signature, new starting note. That scale is natural <Minor />.
            </P>
            <Watch>
              It is not the harmonic <Minor />. Harmonic <Minor /> raises the 7th, so A harmonic <Minor /> has a G♯. The relative <Major /> is the other direction: 3 half-steps up from the <Minor /> tonic. That is not a scale called harmonic <Major />. Harmonic <Major /> is a different scale, and the circle is not showing it.
            </Watch>
          </>
        ),
      },
    ],
  },
  {
    id: "fret",
    name: "5th fret",
    hint: "One fret you can always find, then you count from there.",
    steps: [
      {
        title: "Don’t count from the nut every time.",
        body: (
          <P>Counting seven frets from an open string is slow. Learn the 5th fret on all six strings, then move one or two frets from a note you already know.</P>
        ),
      },
      {
        title: "All Dogs Go Crazy Every Afternoon.",
        body: (
          <>
            <P>Thickest string to thinnest, at fret 5: A D G C E A.</P>
            <div className="mt-3 flex flex-col gap-1">
              {[
                ["All", "A", "6th · low E", "#ad3a6b"],
                ["Dogs", "D", "5th · A", "#e07a2f"],
                ["Go", "G", "4th · D", "#b8860b"],
                ["Crazy", "C", "3rd · G", "#2e7d4f"],
                ["Every", "E", "2nd · B", "#0f766e"],
                ["Afternoon", "A", "1st · high E", "#6a4fb3"],
              ].map(([word, note, string, color]) => (
                <div key={string} className="flex items-baseline gap-3 text-sm">
                  <span className="w-24 font-semibold" style={{ color }}>
                    {word}
                  </span>
                  <span className="w-6 font-medium">{note}</span>
                  <span className="text-muted-foreground">{string}</span>
                </div>
              ))}
            </div>
            <P>
              The colors belong to the six words, so the order sticks. They are not <Major /> and <Minor />.
            </P>
          </>
        ),
      },
      {
        title: "Fret 5 is a perfect 4th up.",
        body: (
          <P>
            Five frets is 5 half-steps. That is a perfect 4th above the open string, on every string, including B. Open strings, thick to thin: E A D G B E. A perfect 4th up each one is A D G C E A.
          </P>
        ),
      },
    ],
  },
  {
    id: "penta",
    name: "Pentatonic",
    hint: "Five notes. Degrees 1, 2, 3, 5, and 6.",
    practice: "scales",
    practiceLabel: "Practice scales",
    steps: [
      {
        title: "Penta means 5.",
        body: (
          <P>
            A <Major /> pentatonic scale keeps five notes of the <Major /> scale and drops 4 and 7. Those are the two notes that make the half-steps.
          </P>
        ),
      },
      {
        title: "1, 2, 3, 5, 6.",
        body: (
          <>
            <p className="mt-2 text-lg font-semibold tracking-wide">
              <span className="text-major">I · II · III</span> · V · <span className="text-major">VI</span>
            </p>
            <P>
              Root, <Major /> 2nd, <Major /> 3rd, perfect 5th, <Major /> 6th.
            </P>
            <P>From C: C D E G A.</P>
          </>
        ),
      },
      {
        title: "The steps are not all whole steps.",
        body: (
          <>
            <P>Whole, whole, a step and a half, whole, a step and a half. In half-steps: 2, 2, 3, 2, 3.</P>
            <P>
              A step and a half is a <Minor /> 3rd. That is the gap where the 4th used to be, and again where the 7th used to be.
            </P>
            <Watch>“W.5” in the notes means one and a half whole steps, not half a whole step.</Watch>
          </>
        ),
      },
      {
        title: "On one string, count frets from the root.",
        body: (
          <>
            <div className="mt-2">
              {[
                ["+ 2 frets", "MAJOR 2nd"],
                ["+ 4 frets", "MAJOR 3rd"],
                ["+ 7 frets", "perfect 5th"],
                ["+ 9 frets", "MAJOR 6th"],
              ].map(([frets, name]) => (
                <div key={frets} className="flex justify-between border-b border-border py-1.5 text-sm last:border-0">
                  <span className="tabular-nums">{frets}</span>
                  <span className={name.startsWith("MAJOR") ? "font-semibold text-major" : ""}>{name}</span>
                </div>
              ))}
            </div>
            <P>
              Same five notes, started on A, are the A <Minor /> pentatonic: A C D E G. You already know that move. It is the relative <Minor />, three half-steps down.
            </P>
          </>
        ),
      },
    ],
  },
];

export function NotesLesson({
  onExit,
  onPractice,
}: {
  onExit: () => void;
  onPractice: (kind: NotesPractice) => void;
}) {
  const [lessonId, setLessonId] = useState<string | null>(null);
  const lesson = LESSONS.find((item) => item.id === lessonId) ?? null;

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden px-4 pt-4">
      <header className="flex shrink-0 items-center justify-between gap-2">
        <Button variant="ghost" size="icon-sm" onClick={lesson ? () => setLessonId(null) : onExit} aria-label="Back">
          <ArrowLeft />
        </Button>
        <BrandMark compact />
        <span className="w-12" />
      </header>
      {lesson ? (
        <Player key={lesson.id} lesson={lesson} onPractice={onPractice} onDone={() => setLessonId(null)} />
      ) : (
        <Picker onPick={setLessonId} />
      )}
    </div>
  );
}

function Picker({ onPick }: { onPick: (id: string) => void }) {
  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Notes</p>
        <h2 className="mt-1 font-display text-2xl tracking-tight">Which idea do you want to walk through?</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The first card is the whole page. Next brings in the next one. <span className="font-semibold text-major">MAJOR</span> stays red.{" "}
          <span className="font-semibold text-minor">minor</span> stays blue.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {LESSONS.map((lesson) => (
          <button
            key={lesson.id}
            type="button"
            onClick={() => onPick(lesson.id)}
            className="flex min-h-16 flex-col items-start justify-center rounded-xl bg-card px-4 py-3 text-left shadow-border"
          >
            <span className="text-lg font-medium">{lesson.id === "penta" ? <><Major /> pentatonic</> : lesson.name}</span>
            <span className="mt-0.5 text-sm text-muted-foreground">{lesson.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Player({
  lesson,
  onPractice,
  onDone,
}: {
  lesson: Lesson;
  onPractice: (kind: NotesPractice) => void;
  onDone: () => void;
}) {
  const [shown, setShown] = useState(1);
  const latest = useRef<HTMLElement>(null);
  const last = shown >= lesson.steps.length;

  useEffect(() => {
    if (shown === 1) return;
    latest.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [shown]);

  return (
    <>
      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {lesson.id === "penta" ? (
            <>
              <Major /> pentatonic
            </>
          ) : (
            lesson.name
          )}
        </p>
        {lesson.steps.slice(0, shown).map((step, index) => (
          <article
            key={index}
            ref={index === shown - 1 ? latest : undefined}
            className={cn("rounded-2xl bg-card px-4 py-4 shadow-border", index === shown - 1 && shown > 1 && "step-in")}
          >
            <h2 className="font-display text-2xl tracking-tight">{step.title}</h2>
            {step.body}
          </article>
        ))}
      </div>
      <div className="-mx-4 flex shrink-0 items-center gap-3 border-t border-border bg-background px-4 pt-3 safe-dock">
        <span className="w-10 text-xs tabular-nums text-muted-foreground">
          {shown}/{lesson.steps.length}
        </span>
        <Button
          size="lg"
          className="h-12 flex-1 rounded-lg"
          onClick={() => {
            if (!last) {
              setShown((value) => value + 1);
              return;
            }
            if (lesson.practice) onPractice(lesson.practice);
            else onDone();
          }}
        >
          {last ? (lesson.practiceLabel ?? "Back to notes") : "Next"}
        </Button>
      </div>
    </>
  );
}
