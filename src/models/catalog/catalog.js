const courses = {
    'CS121': {
        id: 'CS121',
        title: 'Introduction to Programming',
        department: 'Computer Science',
        description: 'Learn programming fundamentals using JavaScript and basic web development concepts.',
        credits: 3,
        sections: [
            { time: '9:00 AM', room: 'STC 392', facultyId: 'brother-jack' },
            { time: '2:00 PM', room: 'STC 394', facultyId: 'sister-enkey' },
            { time: '11:00 AM', room: 'STC 390', facultyId: 'brother-keers' }
        ]
    },
    'CS162': {
        id: 'CS162',
        title: 'Introduction to Computer Science',
        department: 'Computer Science',
        description: 'Object-oriented programming concepts and software development practices.',
        credits: 3,
        sections: [
            { time: '10:00 AM', room: 'STC 392', facultyId: 'brother-jack' },
            { time: '1:00 PM', room: 'STC 394', facultyId: 'sister-enkey' }
        ]
    },
    'MATH113': {
        id: 'MATH113',
        title: 'College Algebra',
        department: 'Mathematics',
        description: 'Fundamental algebra concepts including functions, polynomials, and equations.',
        credits: 3,
        sections: [
            { time: '8:00 AM', room: 'STC 290', facultyId: 'sister-peterson' },
            { time: '11:00 AM', room: 'STC 292', facultyId: 'brother-thompson' },
            { time: '3:00 PM', room: 'STC 290', facultyId: 'sister-anderson' }
        ]
    },
    'MATH119': {
        id: 'MATH119',
        title: 'Calculus I',
        department: 'Mathematics',
        description: 'Introduction to differential and integral calculus with applications.',
        credits: 4,
        sections: [
            { time: '9:00 AM', room: 'STC 290', facultyId: 'brother-thompson' },
            { time: '2:00 PM', room: 'STC 292', facultyId: 'sister-anderson' }
        ]
    },
    'ENG101': {
        id: 'ENG101',
        title: 'College Writing',
        department: 'English',
        description: 'Develop writing skills for academic and professional communication.',
        credits: 3,
        sections: [
            { time: '10:00 AM', room: 'GEB 201', facultyId: 'sister-anderson' },
            { time: '12:00 PM', room: 'GEB 205', facultyId: 'brother-davis' },
            { time: '4:00 PM', room: 'GEB 203', facultyId: 'sister-enkey' }
        ]
    },
    'ENG102': {
        id: 'ENG102',
        title: 'Composition and Literature',
        department: 'English',
        description: 'Advanced writing skills through the study of literature and critical analysis.',
        credits: 3,
        sections: [
            { time: '11:00 AM', room: 'GEB 201', facultyId: 'brother-davis' },
            { time: '1:00 PM', room: 'GEB 205', facultyId: 'sister-enkey' }
        ]
    },
    'HIST105': {
        id: 'HIST105',
        title: 'World History',
        department: 'History',
        description: 'Survey of world civilizations from ancient times to the present.',
        credits: 3,
        sections: [
            { time: '9:00 AM', room: 'GEB 301', facultyId: 'brother-wilson' },
            { time: '2:00 PM', room: 'GEB 305', facultyId: 'sister-roberts' }
        ]
    }
};


const getAllCourses = () => {
    return courses;
};

const getCourseById = (courseId) => {
    return courses[courseId] || null;
};

const getSortedSections = (sections, sortBy) => {
    const sortedSections = [...sections];

    switch (sortBy) {
        case 'professor':
            return sortedSections.sort((a, b) => {
                // Compare by faculty name if available, otherwise by facultyId
                const nameA = a.faculty?.name || a.facultyId;
                const nameB = b.faculty?.name || b.facultyId;
                return nameA.localeCompare(nameB);
            });
        case 'room':
            return sortedSections.sort((a, b) => a.room.localeCompare(b.room));
        case 'time':
        default:
            return sortedSections; // Keep original order
    }
};

const getCoursesByDepartment = () => {
    const departments = {};

    Object.values(courses).forEach(course => {
        if (!departments[course.department]) {
            departments[course.department] = [];
        }
        departments[course.department].push(course);
    });

    return departments;
};

export { getAllCourses, getCourseById, getSortedSections, getCoursesByDepartment };