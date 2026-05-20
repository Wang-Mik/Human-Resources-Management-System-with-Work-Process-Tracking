import api from './api';

export const getBottleneckWorkload = async () => {
  return await api.get('/bottlenecks/workload');
};

export const getBottleneckDetect = async () => {
  return await api.get('/bottlenecks/detect');
};

export const getBottleneckSuggestions = async (workId: number) => {
  return await api.get(`/bottlenecks/suggestions/${workId}`);
};

export const reassignWork = async (data: { workItemId: number, newEmployeeId: number, reassignedBy: number, reason: string }) => {
  return await api.post('/bottlenecks/reassign', data);
};

export const getOverallWorkStatus = async () => {
  return await api.get('/works');
};