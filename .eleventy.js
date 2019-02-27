const { DateTime } = require('luxon');

module.exports = function(config) {
    config.addPassthroughCopy('src/pres');
    config.addPassthroughCopy('src/styles');
    config.addPassthroughCopy('src/fonts');
    config.addFilter('readableDate', (dateObj) => {
        return DateTime.fromJSDate(dateObj).setLocale('ru').toFormat('dd MMMM yyyy');
    });

    return {
        dir: {
            input: 'src',
            output: 'dist'
        },
        passthroughFileCopy: true,
        templateFormats: [
            'md',
            'gif', 'jpg', 'png', 'svg'
        ],
    };
};
