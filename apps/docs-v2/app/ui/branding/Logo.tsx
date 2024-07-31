import { useId } from "react";

export const Logo = (props: React.ComponentPropsWithoutRef<"svg">) => {
  const id = useId();
  return (
    <div className="flex gap-2 items-center">
      <svg
        width="71"
        height="27"
        viewBox="0 0 71 27"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="RVF"
        {...props}
      >
        <path
          d="M0.6875 27V0.818181H11.9886C13.9318 0.818181 15.6321 1.17187 17.0895 1.87926C18.5469 2.58665 19.6804 3.60511 20.4901 4.93466C21.2997 6.2642 21.7045 7.85795 21.7045 9.71591C21.7045 11.5909 21.2869 13.1719 20.4517 14.4588C19.625 15.7457 18.4616 16.7173 16.9616 17.3736C15.4702 18.0298 13.7273 18.358 11.733 18.358H4.98295V12.8352H10.3011C11.1364 12.8352 11.848 12.733 12.4361 12.5284C13.0327 12.3153 13.4886 11.9787 13.804 11.5185C14.1278 11.0582 14.2898 10.4574 14.2898 9.71591C14.2898 8.96591 14.1278 8.35653 13.804 7.88778C13.4886 7.41051 13.0327 7.06108 12.4361 6.83949C11.848 6.60937 11.1364 6.49432 10.3011 6.49432H7.79545V27H0.6875ZM16.0284 14.983L22.5739 27H14.8523L8.46023 14.983H16.0284ZM31.0849 0.818181L36.4542 19.2784H36.6587L42.0281 0.818181H50.0565L41.4144 27H31.6985L23.0565 0.818181H31.0849ZM52.5781 27V0.818181H70.9872V6.54545H59.6861V11.0455H69.8622V16.7727H59.6861V27H52.5781Z"
          fill={`url(#${id})`}
        />
        <defs>
          <linearGradient
            id={id}
            x1="36"
            y1="-8"
            x2="36"
            y2="34"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#D946EF" />
            <stop offset="0.423036" stopColor="#A454F0" />
            <stop offset="1" stopColor="#6366F1" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-violet-800 dark:text-violet-300 font-semibold">
        (Beta)
      </span>
    </div>
  );
};
