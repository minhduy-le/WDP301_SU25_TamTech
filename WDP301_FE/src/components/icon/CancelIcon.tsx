interface ShipIconProps {
  className?: string;
}

const CancelIcon: React.FC<ShipIconProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="-1.125 -1.125 36 36"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke="#000000"
      id="Cart-X--Streamline-Mynaui"
      height="36"
      width="36"
      className={className}
    >
      <desc>Cart X Streamline Icon: https://streamlinehq.com</desc>
      <path
        d="m15.46875 11.953125 4.21875 4.21875m0 -4.21875 -4.21875 4.21875m7.734375 13.359375a2.109375 2.109375 0 1 0 0 -4.21875 2.109375 2.109375 0 0 0 0 4.21875m-11.25 0a2.109375 2.109375 0 1 0 0 -4.21875 2.109375 2.109375 0 0 0 0 4.21875M5.2171875 7.593750000000001h21.3946875c1.9378125 0 3.3370312500000003 1.7859375 2.80546875 3.583125l-2.3259374999999998 7.874999999999999C26.7328125 20.26125 25.588125 21.09375 24.2859375 21.09375H11.4075c-1.30359375 0 -2.4496875 -0.83390625 -2.806875 -2.041875zm0 0L4.21875 4.21875"
        stroke-width="2.25"
      ></path>
    </svg>
  );
};

export default CancelIcon;
