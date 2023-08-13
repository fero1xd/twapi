export const createStartRaidQuery = (from: string | undefined, to: string) => {
  return {
    from_broadcaster_id: from,
    to_broadcaster_id: to,
  };
};
