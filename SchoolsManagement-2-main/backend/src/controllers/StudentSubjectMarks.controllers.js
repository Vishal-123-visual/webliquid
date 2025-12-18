import asyncHandler from "../middlewares/asyncHandler.js";
import studentSubjectMarksModel from "../models/subject/student.subject.marks.models.js";

export const addCourseSubjectMarksController = asyncHandler(
  async (req, res, next) => {
    try {
      // Define the filter criteria to find the existing record
      const filter = {
        studentInfo: req.body.studentId,
        Subjects: req.body.subjectId,
        course: req.body.courseId,
        companyName: req.body.companyName,
      };

      // Define the update data
      const updateData = {
        ...req.body,
        studentInfo: req.body.studentId,
        Subjects: req.body.subjectId,
        course: req.body.courseId,
        companyName: req.body.companyName,
      };

      // Check if a record already exists for the given combination
      const existingRecord = await studentSubjectMarksModel.findOne(filter);

      if (existingRecord) {
        // If the record exists, update it
        await studentSubjectMarksModel.updateOne(filter, updateData);
      } else {
        // If the record does not exist, create a new one
        const newRecord = new studentSubjectMarksModel(updateData);
        await newRecord.save();
      }

      return res
        .status(200)
        .json({ success: true, message: "Marks added/updated successfully" });
    } catch (error) {
      console.error("Error while adding/updating marks:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

export const getCourseSubjectMarksController = asyncHandler(
  async (req, res, next) => {
    try {
      // console.log(req.params.studentId);
      const studentSubjectMarks = await studentSubjectMarksModel
        .find({})
        .populate(["studentInfo", "Subjects", "course", "companyName"]);
      // console.log(studentSubjectMarks);
      res.status(200).json(studentSubjectMarks);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export const updateCourseSubjectMarksController = asyncHandler(
  async (req, res, next) => {
    // console.log(req.params);
    try {
      const { marksId } = req.params;
      const findStudentSubjectMarks = await studentSubjectMarksModel.findById(
        marksId
      );
      if (!findStudentSubjectMarks) {
        return res.status(404).json({ message: "Marks not found" });
      }
      // console.log(findStudentSubjectMarks);

      findStudentSubjectMarks.theory =
        req.body.theory || findStudentSubjectMarks.theory;
      findStudentSubjectMarks.practical =
        req.body.practical || findStudentSubjectMarks.practical;
      findStudentSubjectMarks.totalMarks =
        req.body.totalMarks || findStudentSubjectMarks.totalMarks;
      findStudentSubjectMarks.subjects !== undefined
        ? req.body.subjects
        : findStudentSubjectMarks.subjects;
      findStudentSubjectMarks.studentInfo =
        req.body.studentId || findStudentSubjectMarks.studentInfo;
      findStudentSubjectMarks.Subjects =
        req.body.subjectId || findStudentSubjectMarks.Subjects;
      findStudentSubjectMarks.course =
        req.body.courseId || findStudentSubjectMarks.course;

      const updateStudentMarks = await findStudentSubjectMarks.save();
      res.status(200).json("Updated Student Marks Successfully");
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// export const studentAddOnCourseSubjectController = async (req, res, next) => {
//   try {
//     // console.log(req.body);
//     // console.log(req.user);
//     const {
//       subjectName,
//       subjectCode,
//       fullMarks,
//       passMarks,
//       studentInfo,
//       course,
//       courseType,
//     } = req.body;

//     switch (true) {
//       case !subjectName:
//         return res.status(400).json({ message: "Subject Name is required" });
//       case !subjectCode:
//         return res.status(400).json({ message: "Subject Code is required" });
//       case !fullMarks:
//         return res.status(400).json({ message: "Full Mark is required" });
//       case !passMarks:
//         return res.status(400).json({ message: "Pass Mark is required" });
//       default:
//         break;
//     }

//     let addOnSubject = new AddOnSubjectModel(req.body);
//     addOnSubject.addedBy = req.user.fName + " " + req.user.lName;
//     let addedSubject = await addOnSubject.save();
//     res.status(200).json(addedSubject);
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// export const getAllAddOnSubjectController = async (req, res, next) => {
//   try {
//     const addOnSubjects = await AddOnSubjectModel.find({}).populate([
//       "course",
//       "courseType",
//       "studentInfo",
//     ]);
//     res.status(200).json(addOnSubjects);
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
