
import HomePageSlider from "@/src/components/HomePageSlider";
import TestComponent from "@/src/components/TestComponent";



export default function Home() {
  return (

    <main className="flex flex-col items-center ">
      <div className="container w-full max-w-7x bg-red-200">
        <HomePageSlider />
        <TestComponent />
        <TestComponent />

      </div>
    </main>

  );
}


