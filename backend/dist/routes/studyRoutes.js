"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studyController_1 = require("../controllers/studyController");
const router = (0, express_1.Router)();
router.post("/practice", studyController_1.getPracticeQuestions);
exports.default = router;
