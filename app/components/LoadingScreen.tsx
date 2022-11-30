const LoadingScreen = () => (
  <div className="flex items-center justify-center flex-1">
    <svg
      width="38"
      height="38"
      viewBox="0 0 38 38"
      xmlns="http://www.w3.org/2000/svg"
      stroke="#fff"
      className="animate-spin"
    >
      <g fill="none" fillRule="evenodd">
        <g transform="translate(1 1)" strokeOpacity="2">
          <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
          <path d="M36 18c0-9.94-8.06-18-18-18" />
        </g>
      </g>
    </svg>
  </div>
);

export default LoadingScreen;
