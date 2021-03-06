import { Dispatch } from "react";
import { ThunkAction } from "redux-thunk";
import {usersAPI} from "../api/api";
import { AppStateType } from "./redux-store";

const FOLLOW = `FOLLOW`;
const UNFOLLOW = 'UNFOLLOW';
const SET_USERS = 'SET_USERS';
const SET_CURRENT_PAGE = 'SET_CURRENT_PAGE';
const SET_TOTAL_USERS_COUNT = 'SET_TOTAL_USERS_COUNT';
const TOGGLE_IS_FETCHING = 'TOGGLE_IS_FETCHING';
const TOGGLE_IS_FOLLOWING_PROGRESS = 'TOGGLE_IS_FOLLOWING_PROGRESS';

export type UsersType = {
    name: string,
    id: number,
    uniqueUrlName: null | string,
    photos: {
        small: null | string,
        large: null | string
    },
    status: null | string,
    followed: boolean
} []

type UsersState = {
    users: UsersType,
    pageSize: number,
    totalUserCount: number,
    currentPage: number,
    isFetching: boolean,
    followingInProgress: number[] | []
}

let usersState: UsersState = {
    users: [],
    pageSize: 10,
    totalUserCount: 0,
    currentPage: 1,
    isFetching: false,
    followingInProgress: []
};

type ActionsTypes = FollowSuccess | UnFollowSuccess | SetUsers | SetCurrentPage | SetTotalUsersCount | SetIsFetching | ToggleIsFollowingProgress;

const usersReducer = (state = usersState, action: ActionsTypes) => {
    switch (action.type) {
        case FOLLOW:
            return {
                ...state,
                users: state.users.map(u => {
                    if (u.id === action.userID) {
                        return {...u, followed: true}
                    }
                    return u;
                })
            };
        case UNFOLLOW:
            return {
                ...state,
                users: state.users.map(u => {
                    if (u.id === action.userID) {
                        return {...u, followed: false}
                    }
                    return u;
                })
            };
        case SET_USERS: {
            return {...state, users: action.users}
        }
        case SET_CURRENT_PAGE: {
            return {...state, currentPage: action.currentPage}
        }
        case SET_TOTAL_USERS_COUNT: {
            return {...state, totalUserCount: action.totalUsersCount}
        }
        case TOGGLE_IS_FETCHING: {
            return {...state, isFetching: action.isFetching}
        }
        case TOGGLE_IS_FOLLOWING_PROGRESS: {
            return {
                ...state,
                followingInProgress: action.isFetching
                    ? [...state.followingInProgress, action.userId]
                    : state.followingInProgress.filter(id => id !== action.userId)
            }
        }
        default:
            return state;
    }
};

type FollowSuccess = {
    type: typeof FOLLOW,
    userID: number
}
type UnFollowSuccess = {
    type: typeof UNFOLLOW,
    userID: number
}
type SetUsers = {
    type: typeof SET_USERS,
    users: UsersType
}
type SetCurrentPage = {
    type: typeof SET_CURRENT_PAGE,
    currentPage: number
}
type SetTotalUsersCount = {
    type: typeof SET_TOTAL_USERS_COUNT,
    totalUsersCount: number
}
type SetIsFetching = {
    type: typeof TOGGLE_IS_FETCHING,
    isFetching: boolean
}
type ToggleIsFollowingProgress = {
    type: typeof TOGGLE_IS_FOLLOWING_PROGRESS,
    isFetching: boolean,
    userId: number
}

export const followSuccess = (userID: number): FollowSuccess => ({type: FOLLOW, userID});
export const unFollowSuccess = (userID: number): UnFollowSuccess => ({type: UNFOLLOW, userID});
export const setUsers = (users: UsersType): SetUsers => ({type: SET_USERS, users});
export const setCurrentPage = (currentPage: number): SetCurrentPage => ({type: SET_CURRENT_PAGE, currentPage});
export const setTotalUsersCount = (totalUsersCount: number): SetTotalUsersCount => ({type: SET_TOTAL_USERS_COUNT, totalUsersCount});
export const setIsFetching = (isFetching: boolean): SetIsFetching => ({type: TOGGLE_IS_FETCHING, isFetching});
export const toggleIsFollowingProgress = (isFetching: boolean, userId: number): ToggleIsFollowingProgress => ({
    type: TOGGLE_IS_FOLLOWING_PROGRESS,
    isFetching,
    userId
});

type ThunksTypes = ThunkAction<Promise<void>, AppStateType, unknown, ActionsTypes>

export const requestUsers = (page: number, pageSize: number): ThunksTypes => {
    return async (dispatch) => {
        dispatch(setIsFetching(true));
        let data = await usersAPI.getUsers(page, pageSize)
        dispatch(setIsFetching(false));
        dispatch(setUsers(data.items));
        dispatch(setTotalUsersCount(data.totalCount));
    }
};

const followUnFollowFlow =  async (dispatch: Dispatch<ActionsTypes>, userId: number, ApiMethod: any, SubscriptionSuccess: (userId: number) => FollowSuccess | UnFollowSuccess) => {
        dispatch(toggleIsFollowingProgress(true, userId));
        let response = await ApiMethod(userId);
        if (response.data.resultCode === 0) {
            dispatch(SubscriptionSuccess(userId));
        dispatch(toggleIsFollowingProgress(false, userId));
    }
}

export const follow = (userId: number): ThunksTypes => {
    return async (dispatch) => {
        await followUnFollowFlow(dispatch, userId,usersAPI.follow.bind(usersAPI), followSuccess);
    }
};

export const unFollow = (userId: number): ThunksTypes => {
    return async (dispatch: any) => {
        await followUnFollowFlow(dispatch, userId, usersAPI.unFollow.bind(usersAPI), unFollowSuccess);
    }
};

export default usersReducer;