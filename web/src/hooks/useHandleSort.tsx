import { useCallback } from 'react';

export const useHandleSort = (setData: any, profileDetails: any) => {
  const sortHelper = (a: any, b: any, array: any, index: any) => {
    if (a > b) {
      return array[index].desc ? -1 : 1;
    }
    if (a < b) {
      return array[index].desc ? 1 : -1;
    }
  };
  const ourHandleSort = useCallback(
    (sortBy) => {
      // Doing multisort
      const sorted = profileDetails.slice();
      sorted.sort((a: any, b: any) => {
        for (let i = 0; i < sortBy.length; ++i) {
          if (typeof a[sortBy[i].id] === 'object') {
            if (sortBy[i].id === 'clusters') {
              return sortHelper(a[sortBy[i].id][0], b[sortBy[i].id][0], sortBy, i);
            }
            if (sortBy[i].id === 'technicalLeads' || sortBy[i].id === 'productOwners') {
              return sortHelper(a[sortBy[i].id][0].email, b[sortBy[i].id][0].email, sortBy, i);
            }
          } else {
            return sortHelper(a[sortBy[i].id], b[sortBy[i].id], sortBy, i);
          }
        }
        return 0;
      });
      setData(sorted);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profileDetails],
  );
  return { ourHandleSort };
};
