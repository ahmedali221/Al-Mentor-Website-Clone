import React, { createContext, useContext, useReducer } from "react";
import { mockCourse } from "../data/mockLessonViewerData";

const LessonViewerContext = createContext();

const initialState = {
  course: mockCourse,
  currentModule: 0,
  currentLesson: 0,
  starredLessons: [],
  watchedLessons: [],
  notes: {},
  tab: "viewer",
  toast: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_MODULE": return { ...state, currentModule: action.idx, currentLesson: 0 };
    case "SET_LESSON": return { ...state, currentLesson: action.idx };
    case "STAR_LESSON":
      return { ...state, starredLessons: [...state.starredLessons, action.lessonId] };
    case "UNSTAR_LESSON":
      return { ...state, starredLessons: state.starredLessons.filter(id => id !== action.lessonId) };
    case "MARK_WATCHED":
      return { ...state, watchedLessons: [...new Set([...state.watchedLessons, action.lessonId])] };
    case "SET_TAB": return { ...state, tab: action.tab };
    case "ADD_NOTE":
      return {
        ...state,
        notes: { ...state.notes, [action.lessonId]: action.note },
        toast: { type: "success", message: "Note saved!" }
      };
    case "SHOW_TOAST": return { ...state, toast: action.toast };
    case "HIDE_TOAST": return { ...state, toast: null };
    default: return state;
  }
}

export function LessonViewerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <LessonViewerContext.Provider value={{ state, dispatch }}>
      {children}
    </LessonViewerContext.Provider>
  );
}
export const useLessonViewer = () => useContext(LessonViewerContext);