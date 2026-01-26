'use server'

import {
    deleteCourse as deleteCourseAction,
    deleteLesson as deleteLessonAction,
    deleteGlossaryTerm as deleteGlossaryAction
} from "@/app/actions/education";

export async function deleteCourse(id: number) {
    return await deleteCourseAction(id);
}

export async function deleteLesson(id: number, courseSlug: string) {
    return await deleteLessonAction(id, courseSlug);
}

export async function deleteGlossaryTerm(id: number) {
    return await deleteGlossaryAction(id);
}
