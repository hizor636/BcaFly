import { createContext, useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

export const AuthContext = createContext(null);

const DEFAULT_USERS = {
  admin: {
    id: 'usr-admin-1',
    name: 'Dr. A. Sharma',
    email: 'admin@bcafly.edu',
    role: 'ADMIN',
    roleLabel: 'Administrator',
    semester: 3
  },
  hod: {
    id: 'usr-hod-1',
    name: 'Dr. A. Sharma',
    email: 'hod@bcafly.edu',
    role: 'HOD',
    roleLabel: 'Head of Department',
    semester: 3
  },
  faculty: {
    id: 'FAC02',
    name: 'Prof. K. Rao',
    email: 'rao@bcafly.edu',
    role: 'FACULTY',
    roleLabel: 'Associate Professor',
    semester: 3
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedSession = localStorage.getItem('bcafly_session');
      if (savedSession) {
        try {
          setUser(JSON.parse(savedSession));
        } catch (e) {
          localStorage.removeItem('bcafly_session');
        }
      } else {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const res = await apiClient.get('/auth/me');
            setUser(res.data.data);
          } catch (error) {
            localStorage.removeItem('token');
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginStaff = async (username, password, role) => {
    const validStaff = {
      admin: { user: 'admin', pass: 'admin@123', profile: DEFAULT_USERS.admin },
      hod: { user: 'hod', pass: 'hod@123', profile: DEFAULT_USERS.hod },
      faculty: { user: 'faculty', pass: 'faculty@123', profile: DEFAULT_USERS.faculty }
    };

    const target = validStaff[role?.toLowerCase()];
    if (!target || username !== target.user || password !== target.pass) {
      throw new Error(`Invalid credentials for ${role?.toUpperCase()} portal.`);
    }

    const userData = target.profile;
    localStorage.setItem('bcafly_session', JSON.stringify(userData));
    localStorage.setItem('token', `mock-token-${userData.role}`);
    setUser(userData);
    return userData;
  };

  const loginStudent = async (studentName, semester, allStudents = []) => {
    const cleanName = studentName.trim().toLowerCase();
    const semNum = Number(semester);

    const found = allStudents.find(
      s => s.name.trim().toLowerCase() === cleanName && (Number(s.semester || s.sem) === semNum || semNum === 3)
    ) || {
      id: 'student-s3-001',
      name: studentName,
      usn: 'BCS23CA001',
      reg: 'BCS23CA001',
      semester: semNum || 3,
      section: 'A'
    };

    const userData = {
      id: found.id || `stu-${Date.now()}`,
      name: found.name || studentName,
      usn: found.usn || found.reg || 'BCS23CA001',
      reg: found.reg || found.usn || 'BCS23CA001',
      role: 'STUDENT',
      roleLabel: 'Enrolled Student',
      semester: semNum || 3,
      section: found.section || 'A'
    };

    localStorage.setItem('bcafly_session', JSON.stringify(userData));
    localStorage.setItem('token', 'mock-token-STUDENT');
    setUser(userData);
    return userData;
  };

  const login = async (email, password) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('bcafly_session', JSON.stringify(res.data));
      setUser(res.data);
      return res.data;
    } catch (error) {
      // Fallback staff check
      if (email === 'admin@bcafly.edu' && password === 'admin@123') {
        return loginStaff('admin', 'admin@123', 'admin');
      }
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('bcafly_session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginStaff, loginStudent, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
