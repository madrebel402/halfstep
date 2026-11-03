import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "paper" | "slate" | "primary";

const MAJOR: Record<Tone, string> = {
  paper: "text-major",
  slate: "text-major-on-slate",
  primary: "text-major-on-primary",
};

const MINOR: Record<Tone, string> = {
  paper: "text-minor",
  slate: "text-minor-on-slate",
  primary: "text-minor-on-primary",
};

export function Major({ children = "MAJOR", tone = "paper" }: { children?: ReactNode; tone?: Tone }) {
  return <span className={cn("font-semibold", MAJOR[tone])}>{children}</span>;
}

export function Minor({ children = "minor", tone = "paper" }: { children?: ReactNode; tone?: Tone }) {
  return <span className={cn("font-semibold", MINOR[tone])}>{children}</span>;
}

const WORD = /(maj7|m7|major|minor)/gi;

/** Paint MAJOR red and minor blue. Leaves every other word alone. */
export function QualityText({ text, tone = "paper" }: { text: string; tone?: Tone }) {
  const nodes: ReactNode[] = [];
  const re = new RegExp(WORD);
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = re.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const word = match[1].toLowerCase();
    if (word === "major") nodes.push(<Major key={i} tone={tone} />);
    else if (word === "minor") nodes.push(<Minor key={i} tone={tone} />);
    else if (word === "maj7")
      nodes.push(
        <Fragment key={i}>
          <Major tone={tone}>M</Major>aj7
        </Fragment>,
      );
    else
      nodes.push(
        <Fragment key={i}>
          <Minor tone={tone}>m</Minor>7
        </Fragment>,
      );
    last = match.index + match[1].length;
    i += 1;
  }
  if (last < text.length) nodes.push(text.slice(last));
  if (last === 0) return text;
  return <>{nodes}</>;
}
