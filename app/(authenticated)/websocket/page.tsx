import MainPage from "./MainPage";
import { pingPong } from "./actions";

export default function Home() {
  return <MainPage test={pingPong} />;
}
