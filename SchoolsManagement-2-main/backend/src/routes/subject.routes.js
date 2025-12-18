import { Router } from "express";
import {
  addSubjectController,
  getCourseSubjectsListsController,
  updateCourseSubjectController,
  deleteCourseSubjectController,
  getSubjectBasedOnCourseController,
} from "../controllers/subject.controllers.js";
import { isAdmin, requireSignIn } from "../middlewares/auth.middleware.js";
import {
  addCourseSubjectMarksController,
  getCourseSubjectMarksController,
  updateCourseSubjectMarksController,
} from "../controllers/StudentSubjectMarks.controllers.js";
import { userModel } from "../models/user.models.js";
import { sendEmail } from "../../helpers/sendRemainderFees/SendRemainderFeesStudent.js";
import EmailTemplateModel from "../models/email-remainder/emailTemplate.models.js";
import CompanyModels from "../models/company/company.models.js";
const router = Router();

router
  .route("/")
  .post(requireSignIn, isAdmin, addSubjectController)
  .get(requireSignIn, getCourseSubjectsListsController);
router
  .route("/:id")
  .put(requireSignIn, isAdmin, updateCourseSubjectController)
  .delete(requireSignIn, isAdmin, deleteCourseSubjectController);

router.post("/marks", addCourseSubjectMarksController);
router.get("/marks/:studentId", getCourseSubjectMarksController);
router.put("/marks/:studentId/:marksId", updateCourseSubjectMarksController);

router.post("/subject-mail", requireSignIn, async (req, res, next) => {
  try {
    const subjectData = req.body;
    console.log("Subject Data:", subjectData);

    const templates = await EmailTemplateModel.find({});
    if (templates.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No email templates found" });
    }

    // Assuming you want the first template; adjust as needed.
    let emailContent = templates[0]?.courseSubjectTemplate;

    let adminEmails = "";
    const users = await userModel.find({});

    users?.map((user) => {
      if (user.role === "SuperAdmin") {
        adminEmails += user.email + ",";
      }
    });

    let sendedBy = `${req.user.fName} ${req.user.lName}`;

    // Extract student information from studentData
    const studentInfo = subjectData.studentData;
    const studentId = studentInfo._id;
    const courseId = studentInfo.courseName;
    const desiredSemYear = ["Year 1", "Year 2"];
    // Extract the array of subject entries
    const subjectsArray = subjectData.subjectData;

    const companyData = await CompanyModels.findById(
      subjectData.studentData.companyName
    );

    // Filter subjects for the current student, course, and desired semester year
    const studentSubjects = subjectsArray
      .filter((data) => {
        console.log("Data", data);
        return (
          data.studentInfo._id === studentId && data.course._id === courseId
        );
      }) // Filter by student ID and course ID
      .flatMap((data) => {
        // Filter subjects where the value is true and semYear matches
        return Object.entries(data.subjects)
          .filter(([key, value]) => value === true)
          .map(([key]) => ({
            subjectName: data.Subjects.subjectName,
            semYear: data.Subjects.semYear,
          })); // Map to subject names and semester years
      });

    // Group subjects by semester year and remove duplicates
    const groupedSubjects = studentSubjects.reduce((acc, subject) => {
      if (!acc[subject.semYear]) {
        acc[subject.semYear] = new Set();
      }
      acc[subject.semYear].add(subject.subjectName);
      return acc;
    }, {});

    // Create a string with subjects grouped by semester year
    let subjectsString = "";
    for (const [semYear, subjects] of Object.entries(groupedSubjects)) {
      subjectsString += `${semYear}: ${Array.from(subjects).join(", ")}\n`;
    }

    const generateEmailFromTemplate = (template, data) => {
      return template
        .replace(/<b>(.*?)<\/b>/g, "<strong>$1</strong>")
        .replace(/\$\{(.*?)\}/g, (_, key) => {
          if (key === "subjects") {
            return data.subjectsString.replace(/\n/g, "<br>");
          }
          return (
            key
              .split(".")
              .reduce((obj, keyPart) => obj && obj[keyPart], data) || ""
          );
        });
    };

    // Replace placeholders in the letter template with actual data
    const finalEmailContent = generateEmailFromTemplate(emailContent, {
      ...subjectData.studentData,
      companyName: companyData?.companyName, // Include company name
      companyPhone: companyData?.companyPhone, // Include company phone
      companyAddress: companyData?.companyAddress, // Include company address
      companyEmail: companyData?.email, // Include company email
      companyWebsite: companyData?.companyWebsite, // Include company website
      subjectsString: subjectsString, // Include formatted subjects string
    });

    // Convert line breaks to <br> tags for HTML formatting
    const formattedEmailContent = finalEmailContent.replace(/\n/g, "<br>");

    console.log(subjectsString);

    // Extract the current student's email
    const studentEmail = studentInfo.email;

    sendEmail(
      `${studentEmail},${adminEmails}`, // Use the student's email
      `Your Course Subjects `,
      `Hello ${studentInfo.name}, this is your course subjects.`,
      `${formattedEmailContent}`,
      req,
      sendedBy
    );

    res.status(200).json({
      success: true,
      message: "Email sent to student successfully!",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email.",
    });
  }
});
// router.post(
//   "/add-on-subject",
//   requireSignIn,
//   studentAddOnCourseSubjectController
// );

// router.get("/all-add-on-subjects", getAllAddOnSubjectController);
// get subject according to course
router.get("/:courseId", getSubjectBasedOnCourseController);

export default router;
