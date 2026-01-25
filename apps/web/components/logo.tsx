import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("h-6 w-6", className)}
            {...props}
        >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
    );
}

export function AilarLogo({ className, ...props }: LogoProps) {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("h-6 w-6", className)}
            {...props}
        >
            <defs>
                <mask id="ailar-logo-mask">
                    {/* White fills the mask (visible) */}
                    <rect width="100" height="100" fill="white" />
                    {/* Black cuts out (invisible) - the 'i' with triangle stem */}
                    {/* Small dot above the triangle - the 'i' dot - moved higher */}
                    <circle cx="50" cy="38" r="3.5" fill="black" />
                    {/* Inner triangle - the 'i' stem - taller height */}
                    <path d="M50 46 L62 72 L38 72 Z" fill="black" />
                </mask>
            </defs>

            {/* Outer 'A' with bottom cutout and 'i' mask applied */}
            <path
                d="M50 6L90 92L50 72L10 92L50 6Z"
                mask="url(#ailar-logo-mask)"
            />
        </svg>
    );
}
