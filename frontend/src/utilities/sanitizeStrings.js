export const sanitizeString = (str) => {
    // Replace ^2 with <sup>2</sup>, stripping $ symbols if present
    return str.replace(/\$?\^(\d+)\$?/g, '<sup>$1</sup>');
};
