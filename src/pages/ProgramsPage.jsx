import React from 'react';

const programs = [
    {
        title: "Advanced English Mastery",
        description: "Reach fluency and confidence in English, write professional articles, and develop listening skills.",
        image: "https://www.almentor.net/images/english-mastery.jpg",
        courses: 6
    },
    {
        title: "Campaign Specialist",
        description: "Digital advertising campaigns have become an essential tool for achieving success and growth for any brand or project. With increasing competition and the variety of social media platforms, it is no longer enough to simply...",
        image: "https://www.almentor.net/images/campaign-specialist.jpg",
        courses: 6
    },
    {
        title: "Campaign Specialist",
        description: "Digital advertising campaigns have become an essential tool for achieving success and growth for any brand or project. With increasing competition and the variety of social media platforms, it is no longer enough to simply...",
        image: "https://www.almentor.net/images/campaign-specialist.jpg",
        courses: 6
    },
    {
        title: "Campaign Specialist",
        description: "Digital advertising campaigns have become an essential tool for achieving success and growth for any brand or project. With increasing competition and the variety of social media platforms, it is no longer enough to simply...",
        image: "https://www.almentor.net/images/campaign-specialist.jpg",
        courses: 6
    },
];

function ProgramsPage() {
    return (
        <div className="bg-gray-50 py-10 w-full mt-12">
            <div className="w-full px-8">
                <div className="text-left mb-8">
                    <h1 className="text-5xl font-bold">Learning Programs</h1>
                    <p className="text-2xl mt-2">Structured Learning for Deeper Skill Mastery</p>
                    <p className="text-gray-600 mt-2 text-lg">
                        Take your learning to the next level with almentor Learning Programs—carefully curated course series designed to help you build your skills step by step, guiding you progressively toward your goals.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    {programs.map((program, idx) => (
                        <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                <div className="relative md:w-1/3">
                                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-md flex items-center gap-2">
                                        <span className="material-icons text-sm">play_circle</span>
                                        Program
                                    </div>
                                    <img 
                                        src={program.image} 
                                        alt={program.title} 
                                        className="w-full h-[300px] object-cover"
                                    />
                                    <div className="absolute bottom-4 left-4 bg-gray-900/75 text-white px-3 py-1 rounded-md flex items-center gap-2">
                                        <span className="material-icons text-sm">play_circle</span>
                                        {program.courses} Courses
                                    </div>
                                </div>
                                <div className="p-8 md:w-2/3">
                                    <h2 className="text-2xl font-semibold mb-4">{program.title}</h2>
                                    <p className="text-gray-600 mb-6 line-clamp-3">{program.description}</p>
                                    <button className="border-2 border-gray-900 text-gray-900 px-6 py-2 rounded-md hover:bg-gray-900 hover:text-white transition-colors">
                                        View Program
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ProgramsPage;