export type ShowStatus = {
  dashboard: boolean;
  jobList: boolean;
}

export const PAGES = {
  Dashboard: 'dashboard',
  JobList: 'jobList',
}

export const DEFAULT_SHOW_STATUS: ShowStatus = {
  dashboard: true,
  jobList: false,
}

export const changeStatus = (
  currentStatus: ShowStatus,
  page: typeof PAGES[keyof typeof PAGES]
): ShowStatus => {
  let newStatus = Object.fromEntries(
    Object.keys(currentStatus).map(key => [key, false])
  ) as ShowStatus;

  return {
    ...newStatus,
    [page]: true,
  }
}