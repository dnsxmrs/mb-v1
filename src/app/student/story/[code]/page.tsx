import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import LoadingLink from "@/components/LoadingLink";

// Mock stories data - in a real app, this would come from a database
const stories = {
  "STORY1": {
    title: "Ang Matalinong Maya",
    content: `Isang araw, may isang maya na naghahanap ng pagkain sa kagubatan. Nakakita siya ng isang malaking piraso ng tinapay, pero hindi niya ito mabuhat dahil sa laki nito.

    "Paano ko kaya ito mabubuhat?" tanong ng maya sa sarili.

    Biglang may dumating na isang grupo ng mga maya. "Tulungan natin siya!" sabi ng isa.

    Kaya't pinaghati-hatian nila ang tinapay at dinala ito sa kanilang pugad. Natuto ang maya na ang pagtutulungan ay makakatulong sa paglutas ng mga problema.`,
    moral: "Ang pagtutulungan ay nagbubunga ng tagumpay."
  },
  "STORY2": {
    title: "Ang Masipag na Langgam",
    content: `Sa isang mainit na araw ng tag-araw, may isang langgam na nag-iipon ng pagkain para sa tag-ulan. Habang siya ay abala sa paghahanap ng pagkain, nakakita siya ng isang tipaklong na nagpapahinga sa ilalim ng puno.

    "Bakit ka nag-iipon ng pagkain?" tanong ng tipaklong.

    "Para may makain tayo kapag tag-ulan na," sagot ng langgam.

    "Hayaan mo na! Mag-enjoy ka muna!" sabi ng tipaklong.

    Nang dumating ang tag-ulan, nagutom ang tipaklong habang ang langgam ay may sapat na pagkain.`,
    moral: "Ang paghahanda sa hinaharap ay mahalaga."
  }
};

export default async function StoryPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params;
  // Check if user has given consent and provided info
  const cookieStore = await cookies();
  const hasConsent = cookieStore.get("privacy_consent");
  const studentInfo = cookieStore.get("student_info");

  if (!hasConsent || !studentInfo) {
    redirect("/student/info?code=" + code);
  }

  const { name, authorizedCode } = JSON.parse(studentInfo.value);

  if (authorizedCode !== code) {
    return (
      <div className="h-[85vh] flex flex-col items-center justify-center mx-4">        <h1 className="text-3xl font-extrabold text-blue-700 mb-2">Unauthorized Access</h1>
        <p className="text-gray-500 mb-6 text-center">You are not authorized to access this story. You can only access the story you were originally assigned.</p>
        <LoadingLink
          href={`/student/story/${authorizedCode}`}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
        >
          Go to your assigned story
        </LoadingLink>
      </div>
    );
  }

  const story = stories[code as keyof typeof stories];
  if (!story) {
    // If story doesn't exist, return a page that says "Story not found" with button to redirect home
    return (
      <div className="h-[85vh] flex flex-col items-center justify-center mx-4">        <h1 className="text-3xl font-extrabold text-blue-700 mb-2">Story not found</h1>
        <p className="text-gray-500 mb-6 text-center">Sorry, the story you are looking for does not exist or the code is invalid.</p>
        <LoadingLink
          href="/"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
        >
          Go back home
        </LoadingLink>
      </div>
    );
    // redirect("/");
  }

  return (
    <div className="h-[85vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2">{story.title}</h1>
            <p className="text-gray-600">Para kay: {name}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="whitespace-pre-line text-gray-700">{story.content}</p>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-[#1E3A8A] mb-2">Aral:</h2>
            <p className="text-blue-800">{story.moral}</p>
          </div>
        </div>
      </div>
    </div>
  );
}