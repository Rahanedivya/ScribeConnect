/**
 * Scribe Eligibility Validation Algorithm
 * Validates scribe eligibility based on educational qualifications and subject expertise
 */

class ScribeEligibilityValidator {
    /**
     * Education level hierarchy mapping
     * Lower numbers = lower qualification level
     */
    static EDUCATION_LEVELS = {
        '10th': 1,
        '12th': 2,
        'Diploma': 3,
        'BBA': 4,
        'BSc': 4,
        'BA': 4,
        'BTech': 5,
        'BE': 5,
        'MBA': 6,
        'MTech': 6,
        'MSc': 6,
        'MA': 6,
        'PhD': 7
    };

    /**
     * Validate scribe eligibility for a student request
     * @param {Object} student - Student object with education level and exam subject
     * @param {Object} scribe - Volunteer/Scribe object with education level and subject expertise
     * @param {String} examSubject - The subject of the exam
     * @returns {Object} Validation result with status and reason
     */
    static validateEligibility(student, scribe, examSubject) {
        try {
            // Extract education levels
            if (!student || !scribe) {
                return {
                    eligible: false,
                    status: 'Not Eligible',
                    reason: 'Student or scribe not found',
                    details: {
                        student: !!student,
                        scribe: !!scribe
                    }
                };
            }

            const studentLevel = this.getEducationLevel(student.educationLevel);
            const scribeLevel = this.getEducationLevel(scribe.educationLevel);

            if (studentLevel === 0 || scribeLevel === 0) {
                return {
                    eligible: false,
                    status: 'Not Eligible',
                    reason: 'Missing education data',
                    details: {
                        studentEducation: student.educationLevel,
                        scribeEducation: scribe.educationLevel
                    }
                };
            }

            // Check qualification constraint: scribe must have strictly lower qualification
            if (scribeLevel >= studentLevel) {
                return {
                    eligible: false,
                    status: 'Not Eligible',
                    reason: 'Scribe qualification too high',
                    details: {
                        studentLevel: studentLevel,
                        scribeLevel: scribeLevel,
                        studentLevelName: this.getLevelName(studentLevel),
                        scribeLevelName: this.getLevelName(scribeLevel)
                    }
                };
            }

            // Check subject expertise constraint: scribe must NOT be subject expert
            const scribeExpertise = scribe.subjectExpertise || [];
            const isSubjectExpert = this.isSubjectExpert(scribeExpertise, examSubject);

            if (isSubjectExpert) {
                return {
                    eligible: false,
                    status: 'Not Eligible',
                    reason: 'Scribe is subject expert',
                    details: {
                        examSubject: examSubject,
                        scribeExpertise: scribeExpertise
                    }
                };
            }

            // Check availability status: scribe must be available
            if (scribe.availabilityStatus !== 'available') {
                return {
                    eligible: false,
                    status: 'Not Eligible',
                    reason: 'Scribe is not available',
                    details: {
                        availabilityStatus: scribe.availabilityStatus
                    }
                };
            }

            // All checks passed
            return {
                eligible: true,
                status: 'Eligible',
                reason: 'Eligible',
                details: {
                    studentLevel: studentLevel,
                    scribeLevel: scribeLevel,
                    studentLevelName: this.getLevelName(studentLevel),
                    scribeLevelName: this.getLevelName(scribeLevel),
                    examSubject: examSubject,
                    scribeSubjects: scribeExpertise
                }
            };

        } catch (error) {
            console.error('Error in scribe eligibility validation:', error);
            return {
                eligible: false,
                status: 'Not Eligible',
                reason: 'Validation error',
                details: {
                    error: error.message
                }
            };
        }
    }

    /**
     * Convert education level string to numeric value
     * @param {String} levelString - Education level description
     * @returns {Number} Numeric level value
     */
    static getEducationLevel(levelString) {
        if (!levelString) return 0;

        // Direct mapping
        if (this.EDUCATION_LEVELS[levelString]) {
            return this.EDUCATION_LEVELS[levelString];
        }

        // Handle variations and partial matches
        const normalized = levelString.toLowerCase().trim();

        // Check for degree patterns
        if (normalized.includes('bba') || normalized.includes('bsc') || normalized.includes('ba') || normalized.includes('bachelor')) {
            return 4;
        }
        if (normalized.includes('btech') || normalized.includes('be')) {
            return 5;
        }
        if (normalized.includes('mba') || normalized.includes('mtech') || normalized.includes('msc') || normalized.includes('ma') || normalized.includes('master')) {
            return 6;
        }
        if (normalized.includes('phd') || normalized.includes('post-doctoral') || normalized.includes('postdoctoral')) {
            return 7;
        }

        // Unrecognized or missing education level should be treated as unknown
        console.warn(`Unrecognized education level: ${levelString}, defaulting to level 0`);
        return 0;
    }

    /**
     * Get human-readable level name from numeric value
     * @param {Number} level - Numeric level value
     * @returns {String} Level name
     */
    static getLevelName(level) {
        const levelNames = Object.entries(this.EDUCATION_LEVELS).find(([name, val]) => val === level);
        return levelNames ? levelNames[0] : `Level ${level}`;
    }

    /**
     * Check if scribe is a subject expert in the exam subject
     * @param {Array} scribeSubjects - Array of subjects the scribe knows
     * @param {String} examSubject - The exam subject
     * @returns {Boolean} True if scribe is expert in the subject
     */
    static isSubjectExpert(scribeSubjects, examSubject) {
        if (!scribeSubjects || !Array.isArray(scribeSubjects) || !examSubject) {
            return false;
        }

        const normalizedExamSubject = examSubject.toLowerCase().trim();
        const normalizedScribeSubjects = scribeSubjects.map(s => s.toLowerCase().trim());

        // Exact match
        if (normalizedScribeSubjects.includes(normalizedExamSubject)) {
            return true;
        }

        // Partial match (subject contains exam subject or vice versa)
        return normalizedScribeSubjects.some(scribeSubject =>
            normalizedExamSubject.includes(scribeSubject) ||
            scribeSubject.includes(normalizedExamSubject)
        );
    }

    /**
     * Batch validate multiple scribes for a student request
     * @param {Object} student - Student object
     * @param {Array} scribes - Array of scribe objects
     * @param {String} examSubject - Exam subject
     * @returns {Array} Array of validation results
     */
    static validateMultipleScribes(student, scribes, examSubject) {
        return scribes.map(scribe => ({
            scribeId: scribe._id,
            scribeName: scribe.fullName,
            ...this.validateEligibility(student, scribe, examSubject)
        }));
    }

    /**
     * Filter eligible scribes from a list
     * @param {Object} student - Student object
     * @param {Array} scribes - Array of scribe objects
     * @param {String} examSubject - Exam subject
     * @returns {Array} Array of eligible scribes
     */
    static getEligibilityStatus(volunteer, student, examSubject) {
        const result = this.validateEligibility(student, volunteer, examSubject);

        if (result.eligible) {
            return {
                status: 'Eligible',
                message: 'Volunteer is eligible for this request',
                canSendRequest: true,
                details: result.details
            };
        }

        return {
            status: 'Not Eligible',
            message: `Volunteer is not eligible: ${result.reason}`,
            canSendRequest: false,
            details: result.details
        };
    }

    static validateRequestAcceptance(volunteer, student, examSubject) {
        const result = this.validateEligibility(student, volunteer, examSubject);

        return {
            canAccept: result.eligible,
            message: result.reason || 'User not eligible or account inactive',
            details: result.details
        };
    }

    static filterEligibleScribes(student, scribes, examSubject) {
        return scribes.filter(scribe => {
            const validation = this.validateEligibility(student, scribe, examSubject);
            return validation.eligible;
        });
    }
}

module.exports = ScribeEligibilityValidator;