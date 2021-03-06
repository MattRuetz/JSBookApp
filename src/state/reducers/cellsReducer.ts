import produce from 'immer';
import { ActionType } from '../action-types';
import { Action } from '../actions';
import { Cell } from '../cell';

interface CellsState {
    loading: boolean;
    error: string | null;
    order: string[];
    data: {
        [key: string]: Cell;
    };
}

const initialState: CellsState = {
    loading: false,
    error: null,
    order: [], //list of cell ids in the order they should be displayed
    data: {},
};

const reducer = produce(
    (state: CellsState = initialState, action: Action): CellsState => {
        switch (action.type) {
            case ActionType.UPDATE_CELL:
                //using immer - no need to return a new object
                // able to just update params instead
                const { id, content } = action.payload;

                state.data[id].content = content;
                return state; //ONLY RETURNING TO SATISFY TYPESCRIPT

            case ActionType.DELETE_CELL:
                delete state.data[action.payload]; //payload only holds id for DELETE_CELL
                state.order = state.order.filter((id) => id !== action.payload); //remove id from order[]
                return state;

            case ActionType.MOVE_CELL:
                const { direction } = action.payload;
                const index = state.order.findIndex(
                    (id) => id === action.payload.id
                );
                const targetIndex = direction === 'up' ? index - 1 : index + 1;
                //check if overflowing array on either end
                if (targetIndex < 0 || targetIndex > state.order.length - 1) {
                    return state;
                }

                state.order[index] = state.order[targetIndex];
                state.order[targetIndex] = action.payload.id;

                return state;

            case ActionType.INSERT_CELL_AFTER:
                const cell: Cell = {
                    content: '',
                    type: action.payload.type,
                    id: randomId(),
                };
                state.data[cell.id] = cell;

                const foundIndex = state.order.findIndex(
                    (id) => id === action.payload.id
                );

                if (foundIndex < 0) {
                    state.order.unshift(cell.id);
                } else {
                    state.order.splice(foundIndex + 1, 0, cell.id);
                }
                return state;

            default:
                return state;
        }
    },
    initialState
);

const randomId = () => {
    return Math.random().toString(36).substring(2, 5);
};

export default reducer;
