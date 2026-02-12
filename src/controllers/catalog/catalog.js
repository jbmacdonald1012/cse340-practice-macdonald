import { getAllCourses, getCourseById, getSortedSections } from '../../models/catalog/catalog.js';
import { getFacultyById } from '../../models/faculty/faculty.js';

const catalogPage = (req, res) => {
    const courses = getAllCourses();

    res.render('catalog', {
        title: 'Course Catalog',
        courses: courses
    });
};

const courseDetailPage = (req, res, next) => {
    const courseId = req.params.courseId;
    const course = getCourseById(courseId);

    if (!course) {
        const err = new Error(`Course ${courseId} not found`);
        err.status = 404;
        return next(err);
    }

    const enrichedSections = course.sections.map(section => {
        const faculty = getFacultyById(section.facultyId);
        
        if (!faculty) {
            console.warn(`Warning: Faculty ID "${section.facultyId}" not found for course ${courseId}`);
        }
        
        return {
            ...section,
            faculty: faculty
        };
    });

    const sortBy = req.query.sort || 'time';
    const sortedSections = getSortedSections(enrichedSections, sortBy);

    res.render('course-detail', {
        title: `${course.id} - ${course.title}`,
        course: { ...course, sections: sortedSections },
        currentSort: sortBy
    });
};

export { catalogPage, courseDetailPage };