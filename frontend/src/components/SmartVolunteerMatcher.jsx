/**
 * Example Component: Smart Volunteer Matcher
 * Demonstrates how to use the AI matching system in React components
 * 
 * Usage:
 * import SmartVolunteerMatcher from './SmartVolunteerMatcher';
 * <SmartVolunteerMatcher requestId={requestId} />
 */

import React, { useState } from 'react';
import matchingService from '../services/matchingService';

const SmartVolunteerMatcher = ({ 
  onSelectVolunteer = null, 
  showAutoAllocate = true,
  requestDetails = null 
}) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState(null);

  /**
   * Fetch AI-ranked volunteers
   */
  const fetchSmartMatches = async (subject, examDate, examTime) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await matchingService.getSmartVolunteerMatches({
        subject,
        examDate,
        examTime,
        duration: '2 hours'
      });

      setMatches(result.volunteers || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Auto-allocate best match
   */
  const handleAutoAllocate = async (requestId) => {
    try {
      setLoading(true);
      setError(null);

      const result = await matchingService.autoAllocateVolunteer(requestId);
      
      alert(`Successfully allocated: ${result.allocatedVolunteer.fullName}`);
      onSelectVolunteer?.(result.allocatedVolunteer);
    } catch (err) {
      setError(err.message);
      console.error('Error auto-allocating:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check compatibility with specific volunteer
   */
  const handleCheckCompatibility = async (volunteerId, subject, examDate, examTime) => {
    try {
      const result = await matchingService.getVolunteerCompatibility({
        volunteerId,
        subject,
        examDate,
        examTime
      });

      alert(`Compatibility Score: ${result.compatibilityScore}%`);
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Render score breakdown
   */
  const renderScoreBreakdown = (breakdown) => (
    <div className="score-breakdown mt-2 p-2 bg-gray-100 rounded text-sm">
      <p><span className="font-semibold">Subject Expertise:</span> {breakdown.subjectExpertise}/30</p>
      <p><span className="font-semibold">Availability:</span> {breakdown.availability}/20</p>
      <p><span className="font-semibold">Performance:</span> {breakdown.performance}/25</p>
      <p><span className="font-semibold">Workload:</span> {breakdown.workload}/15</p>
      <p><span className="font-semibold">Location:</span> {breakdown.location}/10</p>
    </div>
  );

  /**
   * Render individual volunteer card
   */
  const renderVolunteerCard = (volunteer, index) => (
    <div
      key={volunteer._id}
      className={`volunteer-card p-4 border-l-4 mb-3 cursor-pointer rounded transition ${
        selectedVolunteerId === volunteer._id 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 bg-white hover:bg-gray-50'
      }`}
      onClick={() => setSelectedVolunteerId(volunteer._id)}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="rank text-lg font-bold text-gray-400">#{index + 1}</span>
            <h3 className="text-lg font-semibold text-gray-800">{volunteer.fullName}</h3>
          </div>
          <p className="text-sm text-gray-600">{volunteer.city}</p>
        </div>
        <div className="text-right">
          <div className="match-score mb-1">
            <span className="text-xl font-bold text-green-600">
              {volunteer.matchPercentage}%
            </span>
            <p className="text-xs text-gray-600">Match Score</p>
          </div>
          {volunteer.rating > 0 && (
            <div className="rating text-sm">
              <span className="font-semibold text-yellow-500">⭐ {volunteer.rating}/5</span>
            </div>
          )}
        </div>
      </div>

      {/* Volunteering Details */}
      <div className="details mb-2">
        <p className="text-sm">
          <span className="font-semibold">Expertise:</span> {volunteer.subjects?.join(', ') || 'General'}
        </p>
        <p className="text-sm">
          <span className="font-semibold">Experience:</span> {volunteer.totalAssignments} assignments completed
        </p>
        {volunteer.lastMinuteHero && (
          <p className="text-sm text-blue-600">
            🚀 <span className="font-semibold">Last-Minute Hero</span> ({volunteer.lastMinuteCount} requests)
          </p>
        )}
      </div>

      {/* Score Breakdown */}
      {volunteer.scoreBreakdown && renderScoreBreakdown(volunteer.scoreBreakdown)}

      {/* Actions */}
      <div className="actions mt-3 flex gap-2 text-xs">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCheckCompatibility(
              volunteer._id,
              requestDetails?.subject || 'Mathematics',
              requestDetails?.examDate || '2024-03-15',
              requestDetails?.examTime || '09:00'
            );
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Check Compatibility
        </button>
        {onSelectVolunteer && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectVolunteer(volunteer);
            }}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Select
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="smart-volunteer-matcher p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🤖 AI-Powered Volunteer Matcher</h2>

      {/* Search section */}
      <div className="search-section mb-6 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold mb-3">Find Best-Matched Volunteers</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <input
            type="text"
            placeholder="Subject (e.g., Mathematics)"
            id="subject"
            className="p-2 border rounded"
          />
          <input
            type="date"
            id="examDate"
            className="p-2 border rounded"
          />
          <input
            type="time"
            id="examTime"
            className="p-2 border rounded"
          />
          <button
            onClick={() => {
              const subject = document.getElementById('subject').value;
              const examDate = document.getElementById('examDate').value;
              const examTime = document.getElementById('examTime').value;
              
              if (subject && examDate && examTime) {
                fetchSmartMatches(subject, examDate, examTime);
              } else {
                alert('Please fill in all fields');
              }
            }}
            disabled={loading}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Find Matches'}
          </button>
        </div>

        {/* Auto-allocate option */}
        {showAutoAllocate && (
          <div className="auto-allocate mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p className="text-sm font-semibold text-yellow-800 mb-2">
              ⚡ Emergency Request? Let AI automatically select the best volunteer.
            </p>
            <button
              onClick={() => handleAutoAllocate('REQUEST_ID_HERE')}
              disabled={loading}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 text-sm font-semibold"
            >
              {loading ? 'Allocating...' : 'Auto-Allocate'}
            </button>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="error p-4 bg-red-100 border-l-4 border-red-500 rounded mb-4">
          <p className="text-red-700 font-semibold">Error</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="loading p-4 text-center">
          <p className="text-gray-600">⏳ Finding best-matched volunteers...</p>
        </div>
      )}

      {/* Results */}
      {!loading && matches.length === 0 && (
        <div className="empty p-6 text-center bg-gray-50 rounded">
          <p className="text-gray-600">
            👉 Enter search criteria and click "Find Matches" to see AI-ranked volunteers
          </p>
        </div>
      )}

      {!loading && matches.length > 0 && (
        <div className="matches-list">
          <h3 className="text-lg font-semibold mb-3">
            Found {matches.length} volunteersMatches - Ranked by AI 🏆
          </h3>
          <div className="volunteers">
            {matches.map((volunteer, index) => renderVolunteerCard(volunteer, index))}
          </div>
        </div>
      )}

      {/* Selection info */}
      {selectedVolunteerId && (
        <div className="selection-info mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <p className="text-green-700 font-semibold">
            ✓ Volunteer selected. Match details shown above.
          </p>
        </div>
      )}

      {/* Info box */}
      <div className="info mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded text-sm">
        <h4 className="font-semibold text-blue-900 mb-2">How does AI Matching work?</h4>
        <ul className="text-blue-800 space-y-1 text-xs">
          <li>📚 <strong>Subject Expertise:</strong> Matches volunteer skills with exam subject</li>
          <li>⏰ <strong>Availability:</strong> Checks if volunteer is free at exam time</li>
          <li>⭐ <strong>Performance:</strong> Considers ratings and past successes</li>
          <li>💼 <strong>Workload:</strong> Balances requests across volunteers</li>
          <li>📍 <strong>Location:</strong> Prefers volunteers in same city or with remote option</li>
        </ul>
      </div>
    </div>
  );
};

export default SmartVolunteerMatcher;

/**
 * STYLING NOTE:
 * The component uses Tailwind CSS classes. If you're not using Tailwind,
 * replace the className attributes with your own CSS modules or styled-components.
 * 
 * Example replacement:
 * <div className="volunteer-card p-4 border-l-4 mb-3 cursor-pointer rounded transition">
 * becomes:
 * <div className={styles.volunteerCard}>
 */
