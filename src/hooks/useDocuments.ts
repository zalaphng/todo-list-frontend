import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import {immer} from 'zustand/middleware/immer';

import api from '@/data/api';
import {IDocumentAttribute, IDocumentCreate, IGetDocuments, IUpdateDocument} from '@/data/api/types/documents.type';

type State = {
  error: boolean;
  isFeching: boolean;
  document: IDocumentAttribute;
  documents: IGetDocuments[];
  documentsFavorite: IGetDocuments[];
};

type Action = {
  getAllDocument: (listId: string) => void;
  getDocument: (id: string) => void;
  updateDocument: (data: IUpdateDocument) => void;
  createDocument: (data: IDocumentCreate) => void;
  resetDocument: () => void;
  resetDocumentFavorite: () => void;
  addDocumentsFavorite: (newItem: IGetDocuments) => void;
  removeDocumentsFavorite: (id: string) => void;
  getDocumentFavorite: (documents: any) => IGetDocuments[];
};

export const useDocumentsStore = create<State & Action>()(
  devtools(
    immer(set => ({
      documents: [],
      documentsFavorite: [],
      error: false,
      isFeching: false,
      document: {} as IDocumentAttribute,
      resetDocument: () => {
        set(state => {
          state.document = {} as IDocumentAttribute;
        });
      },
      resetDocumentFavorite: () => {
        set(state => {
          state.documentsFavorite = state.documents.filter(doc => doc.favorite == true);
        });
      },
      addDocumentsFavorite: newItem => {
        set(prevState => ({documentsFavorite: prevState.documentsFavorite.concat(newItem)}));
      },
      removeDocumentsFavorite: id => {
        set(prevState => ({
          documentsFavorite: prevState.documentsFavorite.filter(doc => doc.id !== id)
        }));
      },
      getDocumentFavorite: documents => {
        function getAllItems(items: any) {
          let result: any[] = [];
          items.forEach((item: {children: string | any[]}) => {
            result.push(item);
            if (item.children && item.children.length > 0) {
              result = [...result, ...getAllItems(item.children)];
            }
          });
          return result;
        }

        const allItems = getAllItems(documents).filter(doc => doc.favorite == true);
        return allItems;
      },
      getAllDocument: async listId => {
        try {
          const res = await api.documents.getListDocument(listId);
          set(
            state => {
              state.documents = res.data;
              state.isFeching = true;
              state.documentsFavorite = state.getDocumentFavorite(state.documents);
              if (!state.document?.id) state.document = state.documents?.[0];
            },
            false,
            'documents/getAllDocument'
          );
        } catch (error) {
          set(
            state => {
              state.error = true;
              state.isFeching = false;
            },
            false,
            'documents/error'
          );
        }
      },
      getDocument: async id => {
        try {
          const res = await api.documents.getOneDocument(id);
          set(
            state => {
              state.document = res.data;
            },
            false,
            'documents/getOneDocument'
          );
        } catch (error) {
          set(
            state => {
              state.isFeching = false;
              state.error = true;
            },
            false,
            'documents/error'
          );
        }
      },
      createDocument: async data => {
        try {
          const res = await api.documents.create(data);
          set(
            state => {
              state.document = res.data;
              state.isFeching = false;
            },
            false,
            'documents/createDocumentSucces'
          );
        } catch (error) {
          set(
            state => {
              state.error = true;
              state.isFeching = false;
            },
            false,
            'documents/createDocumentError'
          );
        }
      },
      updateDocument: async data => {
        try {
          const res = await api.documents.updateDocument(data);
          set(
            state => {
              state.document = res.data;
              state.isFeching = false;
            },
            false,
            'documents/updateDocument'
          );
        } catch (error) {
          set(
            state => {
              state.error = true;
              state.isFeching = false;
            },
            false,
            'documents/error'
          );
        }
      }
    }))
  )
);
