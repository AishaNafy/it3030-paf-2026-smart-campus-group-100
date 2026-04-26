import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Calendar, Edit2, Save, X, Award, BookOpen } from 'lucide-react';
import './StudentProfile.css';

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState({
    id: 'STU001',
    name: 'Hirushi Pathum',
    email: 'hirushi.pathum@university.edu',
    phone: '+94 77 123 4567',
    studentId: 'U2024001',
    department: 'Information Technology',
    year: '2nd Year',
    gpa: '3.8',
    enrollmentDate: '2023-01-15',
    address: 'Colombo, Sri Lanka',
    bio: 'Passionate about web development and cloud technologies.',
    courses: [
      { id: 1, name: 'Web Development', credits: 3, grade: 'A' },
      { id: 2, name: 'Database Systems', credits: 3, grade: 'A+' },
      { id: 3, name: 'Mobile App Development', credits: 3, grade: 'A' },
    ],
    achievements: [
      { id: 1, title: 'Dean\'s List', date: '2024-01-10', description: 'Achieved 3.8 GPA in Fall 2023' },
      { id: 2, title: 'Best Project Award', date: '2023-11-20', description: 'Won first place in Web Development competition' },
      { id: 3, title: 'Scholarship Recipient', date: '2023-08-01', description: 'Merit-based scholarship for academic excellence' },
    ]
  });

  const [editedData, setEditedData] = useState(studentData);

  useEffect(() => {
    // Simulate fetching student data from API
    console.log('Fetching student profile...');
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(studentData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(studentData);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call to save student data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStudentData(editedData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile!');
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="student-profile">
      <div className="profile-header">
        <div className="header-content">
          <div className="profile-avatar">
            {studentData.name.charAt(0).toUpperCase()}
          </div>
          <div className="header-info">
            <h1>{studentData.name}</h1>
            <p className="student-id">{studentData.studentId}</p>
            <p className="department">{studentData.department} • {studentData.year}</p>
          </div>
          <button 
            className={`btn-edit ${isEditing ? 'hidden' : ''}`}
            onClick={handleEdit}
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
        </div>
      </div>

      <div className="profile-container">
        <div className="main-content">
          {/* Personal Information */}
          <section className="profile-section">
            <h2>Personal Information</h2>
            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editedData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editedData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editedData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={editedData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={editedData.bio}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                <div className="edit-buttons">
                  <button className="btn-save" onClick={handleSave} disabled={loading}>
                    <Save size={16} />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn-cancel" onClick={handleCancel}>
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <Mail size={18} />
                  <div>
                    <p className="label">Email</p>
                    <p className="value">{studentData.email}</p>
                  </div>
                </div>
                <div className="info-item">
                  <Phone size={18} />
                  <div>
                    <p className="label">Phone</p>
                    <p className="value">{studentData.phone}</p>
                  </div>
                </div>
                <div className="info-item">
                  <MapPin size={18} />
                  <div>
                    <p className="label">Address</p>
                    <p className="value">{studentData.address}</p>
                  </div>
                </div>
                <div className="info-item">
                  <Calendar size={18} />
                  <div>
                    <p className="label">Enrollment Date</p>
                    <p className="value">{new Date(studentData.enrollmentDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
            {!isEditing && studentData.bio && (
              <div className="bio-section">
                <p className="label">Bio</p>
                <p className="value">{studentData.bio}</p>
              </div>
            )}
          </section>

          {/* Academic Information */}
          <section className="profile-section">
            <h2>Academic Information</h2>
            <div className="academic-grid">
              <div className="academic-card">
                <div className="icon">
                  <Award size={24} />
                </div>
                <div className="content">
                  <p className="label">GPA</p>
                  <p className="value">{studentData.gpa}</p>
                </div>
              </div>
              <div className="academic-card">
                <div className="icon">
                  <BookOpen size={24} />
                </div>
                <div className="content">
                  <p className="label">Department</p>
                  <p className="value">{studentData.department}</p>
                </div>
              </div>
              <div className="academic-card">
                <div className="icon">
                  <Calendar size={24} />
                </div>
                <div className="content">
                  <p className="label">Year</p>
                  <p className="value">{studentData.year}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Current Courses */}
          <section className="profile-section">
            <h2>Current Courses</h2>
            <div className="courses-list">
              {studentData.courses.map(course => (
                <div key={course.id} className="course-item">
                  <div className="course-info">
                    <p className="course-name">{course.name}</p>
                    <p className="course-credits">{course.credits} Credits</p>
                  </div>
                  <div className="course-grade">
                    <span className={`grade-badge grade-${course.grade.toLowerCase()}`}>
                      {course.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar - Achievements */}
        <aside className="sidebar">
          <section className="achievements-section">
            <h3>Achievements</h3>
            <div className="achievements-list">
              {studentData.achievements.map(achievement => (
                <div key={achievement.id} className="achievement-item">
                  <div className="achievement-icon">🏆</div>
                  <div className="achievement-content">
                    <p className="achievement-title">{achievement.title}</p>
                    <p className="achievement-date">{new Date(achievement.date).toLocaleDateString()}</p>
                    <p className="achievement-description">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Stats */}
          <section className="stats-section">
            <h3>Quick Stats</h3>
            <div className="stats">
              <div className="stat">
                <p className="stat-label">Total Courses</p>
                <p className="stat-value">{studentData.courses.length}</p>
              </div>
              <div className="stat">
                <p className="stat-label">Achievements</p>
                <p className="stat-value">{studentData.achievements.length}</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default StudentProfile;
