// Default section titles used across the course detail page and the admin
// course builder. Keys are stable identifiers; the stored `section_titles`
// JSON on a course only needs to override the keys it customizes.

export const DEFAULT_SECTION_TITLES = {
    what_youll_learn: 'আপনি যা শিখবেন',
    tools: 'কি কি টুল শিখবেন',
    description: 'কোর্স বিবরণ',
    audience: 'কাদের জন্য এই কোর্স?',
    curriculum: 'সম্পূর্ণ কারিকুলাম',
    problem_solution: 'আপনার সমস্যা আমাদের সমাধান',
    instructor: 'আমাদের ইনস্ট্রাক্টর',
    reviews: 'কোর্স রিভিউ',
    faq: 'সচরাচর প্রশ্ন ও উত্তর',
    requirements: 'প্রয়োজনীয় রিকোয়ারমেন্টস',
    this_course_includes: 'কোর্সের সাথে যা যা থাকছে',
};

// The order in which editable section titles appear in the admin builder.
export const SECTION_KEYS = [
    'what_youll_learn',
    'tools',
    'description',
    'audience',
    'curriculum',
    'problem_solution',
    'instructor',
    'reviews',
    'faq',
    'requirements',
    'this_course_includes',
];

export const getSectionTitle = (sectionTitles, key) => {
    if (sectionTitles && typeof sectionTitles === 'object') {
        if (key === 'tools' && typeof sectionTitles.tools_title === 'string' && sectionTitles.tools_title.trim() !== '') {
            return sectionTitles.tools_title;
        }
        if (typeof sectionTitles[key] === 'string' && sectionTitles[key].trim() !== '') {
            return sectionTitles[key];
        }
    }
    return DEFAULT_SECTION_TITLES[key] || key;
};
