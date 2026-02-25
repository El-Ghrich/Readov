import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="glass-dark p-8 md:p-12 rounded-2xl border border-white/5 space-y-8 animate-in fade-in duration-500">
        <div className="border-b border-white/10 pb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            About Readov
          </h1>
        </div>

        <div className="prose prose-invert max-w-none text-gray-300 space-y-6 leading-relaxed">
          <p>
            The idea for Readov didn’t start in a meeting room. It didn’t come
            from a pitch deck. It started on the floor of our living room — with
            a six-year-old boy named Lopik.
          </p>

          <p>
            Lopik is the kind of kid who never just accepts something as it is.
            He wants to know why. He wants to know how. He wants to imagine what
            would happen if one tiny detail changed in the story.
          </p>

          <p>
            One day, we were telling him a simple story — just to entertain him.
            And he interrupted after every sentence.
          </p>

          <div className="pl-4 border-l-2 border-purple-500/50 italic text-gray-400 my-4">
            <p className="mb-1">“Can the hero be a girl instead?”</p>
            <p className="mb-1">“What if the monster is actually good?”</p>
            <p className="mb-1">“Why did this even happen?”</p>
            <p>“And what does this word mean?”</p>
          </div>

          <p>
            We laughed… but we also noticed something powerful: this is
            learning.
          </p>

          <p>
            Not the type from books. Not memorizing. Not forced lessons. But
            natural curiosity. Curiosity that comes from the heart, not from
            tests.
          </p>

          <p>
            We watched his eyes light up every time he changed the direction of
            the story. We watched how deeply he paid attention when the story
            related to something he already cared about.
          </p>

          <p>
            And suddenly, it hit us:{" "}
            <strong className="text-white">
              Learning becomes magic when you let the learner be part of the
              story.
            </strong>
          </p>

          <p>So we asked ourselves:</p>

          <ul className="list-disc pl-5 space-y-2">
            <li>What if stories could adapt to every child’s imagination?</li>
            <li>
              What if learning goals could fit naturally inside adventure and
              fantasy?
            </li>
            <li>
              What if we could turn curiosity itself into the engine of
              education?
            </li>
          </ul>

          <p>
            That is how the first spark of Readov was born — the “Open Vision”
            of learning through stories. From two brothers who simply paid
            attention to a child’s questions.
          </p>

          <p>
            Because here’s the truth we believe deeply: Learning doesn’t stop at
            school. It never stops — no matter how old we are.
          </p>

          <p>
            We learn when we dream. We learn when we imagine. We learn when we
            ask “why?” — exactly like Lopik does.
          </p>

          <p>
            Readov is our way of making that feeling universal. To help kids,
            teens, adults — everyone — learn through personal stories. To make
            education feel like adventure again. To turn reading, writing, and
            curiosity into something joyful and limitless.
          </p>

          <p>
            Readov is not just an app. It is a reminder: The greatest classrooms
            in the world are stories. And every person deserves to live inside
            one.
          </p>
        </div>
      </div>
    </div>
  );
}
