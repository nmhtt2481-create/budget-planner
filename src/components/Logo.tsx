export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" fill="#5B5CE2" />
      <path
        d="M9 15.5C9 14.672 9.672 14 10.5 14H15V9.5C15 8.672 15.672 8 16.5 8C17.328 8 18 8.672 18 9.5V14H22.5C23.328 14 24 14.672 24 15.5C24 16.328 23.328 17 22.5 17H18V21.5C18 22.328 17.328 23 16.5 23C15.672 23 15 22.328 15 21.5V17H10.5C9.672 17 9 16.328 9 15.5Z"
        fill="#FFFFFF"
      />
    </svg>
  )
}