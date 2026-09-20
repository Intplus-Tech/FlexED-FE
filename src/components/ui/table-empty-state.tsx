import { cn } from "@/lib/utils";

interface TableEmptyStateProps {
  title?: string;
  description?: string;
  /** Rendered under the copy — e.g. the same "Add student" button as the toolbar. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * The standard "nothing to show" state for a table body.
 *
 * Deliberately distinct from `TableErrorState`: a list that loaded and is
 * genuinely empty needs different words (and a different next step) from one
 * that failed to load, and showing the empty copy for a failed request is how a
 * broken endpoint gets mistaken for an empty table.
 */
export function TableEmptyState({
  title = "No records found",
  description = "There are no records to display at the moment.",
  action,
  className,
}: TableEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-8 py-14",
        className
      )}
    >
      <div className="mb-6 select-none" aria-hidden="true">
        <svg
          width="190"
          height="150"
          viewBox="0 0 190 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="95" cy="145" rx="75" ry="5" fill="#f3e8ff" />

          <defs>
            <clipPath id="table-empty-doc">
              <rect x="15" y="10" width="102" height="115" rx="10" />
            </clipPath>
          </defs>
          <g clipPath="url(#table-empty-doc)">
            <rect x="15" y="10" width="102" height="115" fill="white" />
            <rect x="15" y="10" width="102" height="30" fill="#9333ea" />
            <rect
              x="27"
              y="20"
              width="44"
              height="5"
              rx="2.5"
              fill="white"
              opacity="0.6"
            />
            <rect
              x="97"
              y="19"
              width="12"
              height="7"
              rx="3.5"
              fill="white"
              opacity="0.3"
            />
          </g>
          <rect
            x="15"
            y="10"
            width="102"
            height="115"
            rx="10"
            stroke="#E5E7EB"
            strokeWidth="1.5"
            fill="none"
          />

          <circle cx="35" cy="57" r="8" fill="#F3F4F6" />
          <rect x="49" y="52" width="42" height="5" rx="2.5" fill="#E5E7EB" />
          <rect x="49" y="60" width="28" height="4" rx="2" fill="#F3F4F6" />
          <line x1="15" y1="72" x2="117" y2="72" stroke="#F3F4F6" strokeWidth="1" />

          <circle cx="35" cy="83" r="8" fill="#F3F4F6" />
          <rect x="49" y="78" width="35" height="5" rx="2.5" fill="#E5E7EB" />
          <rect x="49" y="86" width="22" height="4" rx="2" fill="#F3F4F6" />
          <line x1="15" y1="98" x2="117" y2="98" stroke="#F3F4F6" strokeWidth="1" />

          <circle cx="35" cy="109" r="8" fill="#F9FAFB" />
          <rect x="49" y="104" width="28" height="5" rx="2.5" fill="#F3F4F6" />
          <rect x="49" y="112" width="18" height="4" rx="2" fill="#F9FAFB" />

          <circle cx="140" cy="78" r="36" fill="#f3e8ff" />
          <circle
            cx="140"
            cy="75"
            r="28"
            fill="white"
            stroke="#E5E7EB"
            strokeWidth="1.5"
          />
          <circle cx="140" cy="75" r="24" fill="#faf5ff" />
          <line
            x1="161"
            y1="96"
            x2="175"
            y2="113"
            stroke="#D1D5DB"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <rect x="128" y="66" width="24" height="3.5" rx="1.75" fill="#D1D5DB" />
          <rect x="128" y="73" width="18" height="3.5" rx="1.75" fill="#E5E7EB" />
          <rect x="128" y="80" width="20" height="3.5" rx="1.75" fill="#E5E7EB" />

          <circle cx="4" cy="28" r="4" fill="#e9d5ff" />
          <circle
            cx="184"
            cy="14"
            r="5"
            fill="#f3e8ff"
            stroke="#e9d5ff"
            strokeWidth="1.5"
          />
          <circle cx="2" cy="92" r="2.5" fill="#d8b4fe" opacity="0.55" />
          <circle cx="184" cy="125" r="3" fill="#d8b4fe" opacity="0.45" />
          <circle cx="98" cy="142" r="2" fill="#e9d5ff" />
          <circle cx="170" cy="42" r="3" fill="#e9d5ff" />
          <circle cx="5" cy="135" r="1.5" fill="#e9d5ff" />
        </svg>
      </div>

      <div className="max-w-65 space-y-1.5 text-center">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {/* Callers that say everything in the title pass description="" — a
            generic second line under a specific first one just reads as noise. */}
        {description ? (
          <p className="text-sm leading-relaxed text-gray-500">{description}</p>
        ) : null}
      </div>

      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
