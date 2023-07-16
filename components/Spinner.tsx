import Image from "next/image";
import spinnerImage from "@/app/_assets/spinner.svg";
import classNames from "classnames";

export default function Spinner(props: { className?: string }) {
  return (
    <Image
      src={spinnerImage}
      alt=""
      className={classNames("inline-block", props.className)}
    />
  );
}
