import { getFacultyBySlug, getSortedFaculty } from '../../models/faculty/faculty.js';

const facultyListPage = async (req, res) => {
    // Handle sorting if requested
    const sortBy = req.query.sort || 'department';
    const faculty = await getSortedFaculty(sortBy);

    res.render('faculty/list', {
        title: 'Faculty',
        faculty,
        currentSort: sortBy
    });
};

const facultyDetailPage = async (req, res, next) => {
    const facultyId = req.params.facultyId;
    const facultyMember = await getFacultyBySlug(facultyId);

    if (Object.keys(facultyMember).length === 0) {
        const err = new Error(`Faculty member ${facultyId} not found`);
        err.status = 404;
        return next(err);
    }

    res.render('faculty/detail', {
        title: facultyMember.name,
        facultyMember
    });
};

export { facultyListPage, facultyDetailPage };

