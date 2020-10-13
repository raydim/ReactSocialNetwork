import {profileAPI, usersAPI} from "../api/api";
import {stopSubmit} from "redux-form";

const ADD_POST = 'ADD-POST';
const SET_USER_PROFILE = 'SET_USER_PROFILE';
const SET_STATUS = 'SET_STATUS';
const SAVE_PHOTO_SUCCESS = 'SAVE_PHOTO_SUCCESS';


type InitialState = {
    posts : {id: number, message: string, like: number}[],
    profile: null | (string | number)[], // refactor this line!!!! it's not true type data.  
    status: string                      // i just want to sleep right now and wrote this for youself
}

let initialState: InitialState = {
    posts: [
        {id: 1, message: 'Привет, как дела ?', like: 15},
        {id: 2, message: "Это мой первый пост !", like: 20}
    ],
    profile: null,
    status: ""

};

const profileReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case ADD_POST: {
            let newPost = {
                id: 5,
                message: action.newPostText,
                like: 0
            };
            return {
                ...state,
                posts: [...state.posts, newPost],
            };
        }
        case SET_USER_PROFILE: {
            return {...state, profile: action.profile}
        }
        case SET_STATUS: {
            return {...state, status: action.status}
        }
        case SAVE_PHOTO_SUCCESS: {
            return {...state, profile: {...state.profile, photos: action.photos}}
        }
        default:
            return state;
    }
}

type SetStatus = {
    type: typeof SET_STATUS
    status: string
}
type AddPostActionCreator = {
    type: typeof ADD_POST
    newPostText: string
}
type setUserProfile = {
    type: typeof SET_USER_PROFILE
    profile: {}
}
type savePhotoSuccess = {
    type: typeof SAVE_PHOTO_SUCCESS
    photos: string
}


export const setStatus = (status: string): SetStatus => ({type: SET_STATUS, status})
export const addPostActionCreator = (newPostText:string):AddPostActionCreator => ({type: ADD_POST, newPostText})
export const setUserProfile = (profile: string) => ({type: SET_USER_PROFILE, profile})
export const savePhotoSuccess = (photos: string) => ({type: SAVE_PHOTO_SUCCESS, photos})


export const getUserProfile = (userId: number) => async (dispatch: any) => {
    let response = await usersAPI.getProfile(userId);
    dispatch(setUserProfile(response.data));
};
// can use async - await
export const getStatus = (userId: number) => async (dispatch: any) => {
    let response = await profileAPI.getStatus(userId);
    dispatch(setStatus(response.data))
};

// or use .then
export const updateStatus = (status: string) => async (dispatch: any) => {
    let response = await profileAPI.updateStatus(status);
    if (response.data.resultCode === 0) {
        dispatch(setStatus(status))
    }
};
export const savePhoto = (file: string) => async (dispatch: any) => {
    let response = await profileAPI.savePhoto(file);
    if (response.data.resultCode === 0) {
        dispatch(savePhotoSuccess(response.data.data.photos))
    }
};
export const saveProfile = (profile: string) => async (dispatch: any, getState: any) => {
    let userId = getState().auth.userId;
    let response = await profileAPI.saveProfile(profile);
    if (response.data.resultCode === 0) {
        dispatch(getUserProfile(userId));
    } else {
        dispatch(stopSubmit("edit-profile", {_error: response.data.messages[0]}));
        return Promise.reject(response.data.messages[0]);
    }
};


export default profileReducer;