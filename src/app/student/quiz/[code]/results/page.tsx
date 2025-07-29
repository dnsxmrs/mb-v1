import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import LoadingLink from "@/components/LoadingLink";
import UnauthorizedRedirect from "@/components/UnauthorizedRedirect";
import { getStoryByCode } from "@/actions/code";
import { getSubmissionResultsByCode } from "@/actions/quiz";
import { Metadata } from "next";
import { hasStudentViewedStory } from "@/actions/story-view";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ code: string }>
}): Promise<Metadata> {
    const { code } = await params;

    try {
        const storyResult = await getStoryByCode(code);

        if (storyResult.success && storyResult.data) {
            const { story } = storyResult.data;
            return {
                title: `${story.title} | E-KWENTO`,
                description: story.description || `Read the story "${story.title}" by ${story.author}`,
            };
        }
    } catch (error) {
        console.error('Error generating metadata:', error);
    }

    // Fallback metadata if story is not found
    return {
        title: "Results | E-KWENTO",
        description: "View your quiz results",
    };
}

export default async function ResultPage({
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

    const { name, section, deviceId } = JSON.parse(studentInfo.value);
    // check in studentstoryview if code, fullname, section, deviceId already exists
    const authorized = await hasStudentViewedStory(code, name, section, deviceId || '')

    if (authorized.data?.hasViewed === false) {
        return <UnauthorizedRedirect authorizedCode={code} />;
    }

    // Get story from database using the code
    const storyResult = await getStoryByCode(code);

    if (!storyResult.success || !storyResult.data) {
        return (
            <div className="h-[85vh] flex flex-col items-center justify-center mx-4">
                <h1 className="text-3xl font-extrabold text-blue-700 mb-2">Quiz not found</h1>
                <p className="text-gray-500 mb-6 text-center">
                    {storyResult.error || "Sorry, the story you are looking for does not exist or the code is invalid."}
                </p>
                <LoadingLink
                    href="/"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                >
                    Go back home
                </LoadingLink>
            </div>
        );
    }

    const { story } = storyResult.data;

    // Get submission results
    const submissionResult = await getSubmissionResultsByCode(code, name, section, deviceId || '');

    if (!submissionResult.success || !submissionResult.data) {
        return (
            <div className="h-[85vh] flex flex-col items-center justify-center mx-4">
                <h1 className="text-3xl font-extrabold text-orange-600 mb-2">No Results Found</h1>
                <p className="text-gray-500 mb-6 text-center">
                    You haven&apos;t submitted the quiz yet or there was an error retrieving your results.
                </p>
                <div className="space-y-4">
                    <LoadingLink
                        href={`/student/quiz/${code}`}
                        className="block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition text-center"
                    >
                        Take the Quiz
                    </LoadingLink>
                    <LoadingLink
                        href="/"
                        className="block px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold shadow hover:bg-gray-700 transition text-center"
                    >
                        Go Home
                    </LoadingLink>
                </div>
            </div>
        );
    }

    const results = submissionResult.data;
    const percentage = Math.round(results.percentage);
    const isPassingGrade = percentage >= 75; // Assuming 75% is passing

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full overflow-hidden">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2">Resulta ng Pagsusulit</h1>
                        <h2 className="text-xl text-gray-600 mb-1">{story.title}</h2>
                        <p className="text-gray-500 text-sm italic">ni {story.author}</p>
                    </div>

                    {/* Score Card */}
                    {/* <div className={`text-black rounded-xl p-6 mb-5 text-center`}>
                        <div className={`text-6xl font-bold mb-2 ${isPassingGrade
                            ? 'text-green-400'
                            : 'text-red-400'
                            }`}>
                            {results.correctAnswers}/{results.totalQuestions}
                        </div>
                        <div className="text-sm opacity-90 mt-4">
                            {isPassingGrade
                                ? 'Magaling! Nakapasa ka sa pagsusulit!'
                                : "Huwag mag-alala, palaging may pagkakataon upang matuto mula sa karanasang ito!"
                            }
                        </div>
                    </div> */}

                    {/* Student Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">Pangalan:</span>
                                <span className="ml-2 text-gray-900">{results.fullName}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Seksyon:</span>
                                <span className="ml-2 text-gray-900">{results.section}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Isinumite:</span>
                                <span className="ml-2 text-gray-900">
                                    {new Date(results.submittedAt).toLocaleString('tl-PH', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                        timeZone: 'Asia/Manila',
                                    })}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Iskor:</span>
                                <span className={`font-semibold ml-2 text-gray-900 ${isPassingGrade
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                    }`}>
                                    {results.correctAnswers}/{results.totalQuestions}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Results */}
                    <div className="space-y-6 mb-8">
                        <h3 className="text-xl font-semibold text-gray-800">Pagsusuri ng Resulta</h3>

                        {results.answers.map((answer, index) => (
                            <div key={index} className={`border rounded-lg p-4 ${answer.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                }`}>
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-gray-900">
                                        {answer.quizNumber}. {answer.question}
                                    </h4>
                                    <span className={`px-2 py-1 rounded text-sm font-medium whitespace-nowrap flex-shrink-0 ${answer.isCorrect
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {answer.isCorrect ? '✓ Tama' : '✗ Mali'}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Iyong sagot:</span>
                                        <span className={`ml-2 ${answer.isCorrect ? 'text-green-700' : 'text-red-700'
                                            }`}>
                                            {answer.selectedAnswer}
                                        </span>
                                    </div>

                                    {!answer.isCorrect && (
                                        <div>
                                            <span className="font-medium text-gray-700">Tamang sagot:</span>
                                            <span className="ml-2 text-green-700 font-medium">
                                                {answer.correctAnswer}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-10">
                        <LoadingLink
                            href={`/student/story/${code}`}
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium text-lg shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                        >
                            Bumalik sa Kwento
                        </LoadingLink>
                        <LoadingLink
                            href="/libraries"
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium text-lg shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                        >
                            E-Aklatan
                        </LoadingLink>
                    </div>
                </div>
            </div>
        </div>
    );
}