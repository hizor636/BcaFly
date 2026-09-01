import { createContext, useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

export const AuthContext = createContext(null);

const DEFAULT_USERS = {
  admin: {
    id: 'usr-admin-1',
    name: 'Dr. B. K. Sharma',
    email: 'admin@bcafly.edu',
    role: 'ADMIN',
    roleLabel: 'Administrator',
    semester: 1
  },
  hod: {
    id: 'usr-hod-1',
    name: 'Dr. Ananya Rao',
    email: 'hod@bcafly.edu',
    role: 'HOD',
    roleLabel: 'Head of Department',
    semester: 1
  },
  faculty: {
    id: 'FAC03',
    name: 'Prof. Rahul Nair',
    email: 'rahul@bcafly.edu',
    role: 'FACULTY',
    roleLabel: 'Associate Professor',
    semester: 1
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedSession = localStorage.getItem('bcafly_session_v4');
      if (savedSession) {
        try {
          setUser(JSON.parse(savedSession));
        } catch (e) {
          localStorage.removeItem('bcafly_session_v4');
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
    localStorage.setItem('bcafly_session_v4', JSON.stringify(userData));
    localStorage.setItem('token', `mock-token-${userData.role}`);
    setUser(userData);
    return userData;
  };

  const loginStudent = async (studentIdentifier, semester, allStudents = []) => {
    const cleanQuery = studentIdentifier.trim().toLowerCase();
    const semNum = Number(semester) || 1;

    const found = allStudents.find(
      s => (s.name && s.name.trim().toLowerCase() === cleanQuery) ||
           (s.reg && s.reg.trim().toLowerCase() === cleanQuery) ||
           (s.usn && s.usn.trim().toLowerCase() === cleanQuery)
    );

    const userData = {
      id: found ? found.id : `stu-${Date.now()}`,
      name: found ? found.name : studentIdentifier,
      usn: found ? (found.usn || found.reg) : studentIdentifier,
      reg: found ? (found.reg || found.usn) : studentIdentifier,
      role: 'STUDENT',
      roleLabel: 'Enrolled Student',
      semester: found ? (Number(found.semester || found.sem) || semNum) : semNum,
      section: found ? (found.section || 'A') : 'A'
    };

    localStorage.setItem('bcafly_session_v4', JSON.stringify(userData));
    localStorage.setItem('token', 'mock-token-STUDENT');
    setUser(userData);
    return userData;
  };

  const login = async (email, password) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('bcafly_session_v4', JSON.stringify(res.data));
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
    localStorage.removeItem('bcafly_session_v4');
    localStorage.removeItem('bcafly_session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginStaff, loginStudent, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
