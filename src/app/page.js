import Link from 'next/link';
import Spinner from "../../components/spinner";
import ToastButton from "../../components/ToastTest";


export default function Home() {
  return (
      <>
      <ToastButton/>
        <Spinner visible={1}/>
      </>
  );
}
