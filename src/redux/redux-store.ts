import {applyMiddleware, combineReducers, createStore} from "redux";
import profileReducer from "./profile-reducer";
import dialogsReducer from "./dialogs-reducer";
import usersReducer from "./users-reducer";
import authReducer from "./auth-reducer";
import thunkMidleware from 'redux-thunk';
import {reducer as formReducer } from "redux-form";
import appReducer from "./app-reducer";
import { composeWithDevTools } from 'redux-devtools-extension';

let reducers = combineReducers({
    profilePage: profileReducer,
    dialogsPage: dialogsReducer,
    usersPage: usersReducer,
    auth: authReducer,
    form: formReducer,
    app: appReducer
});

type ReducersType = typeof reducers;
export type AppStateType = ReturnType<ReducersType>;

let store = createStore(reducers, composeWithDevTools(applyMiddleware(thunkMidleware)));
// @ts-ignore
window.store = store;

export default store;