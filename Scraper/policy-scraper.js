const puppeteer = require('puppeteer');
const fs = require('fs');

const SECTION_COLOR_CODES = {
    FIRST_PARTY_COLLECTION_AND_USE: '(51, 102, 170)',
    THIRD_PARTY_SHARING_AND_COLLECTION: '(17, 170, 153)',
    USER_CHOICE_AND_CONTROL: '(102, 170, 85)',
    USER_ACCESS_EDIT_AND_DELETION: '(204, 205, 37)',
    DATA_RETENTION: '(153, 34, 136)',
    DATA_SECURTIY: '(238, 51, 51)',
    POLICY_CHANGE: '(238, 119, 34)',
    DO_NOT_TRACK: '(255, 238, 51)',
    INTERNATIONAL_AND_SPECIFIC_AUDIENCES: '(119, 119, 119)'
}

const SECTION_CATEGORIES = {
    FIRST_PARTY_COLLECTION_AND_USE: 'First Party Collection/Use',
    THIRD_PARTY_SHARING_AND_COLLECTION: 'Third Party Sharing/Collection',
    USER_CHOICE_AND_CONTROL: 'User Choice/Control',
    USER_ACCESS_EDIT_AND_DELETION: 'User Access, Edit and Deletion',
    DATA_RETENTION: 'Data Retention',
    DATA_SECURTIY: 'Data Security',
    POLICY_CHANGE: 'Policy Change',
    DO_NOT_TRACK: 'Do Not Track',
    INTERNATIONAL_AND_SPECIFIC_AUDIENCES: 'International and Specific Audiences'
}

const SECTION_COLOR_REGEX = /[\(][\d,\s]*[\)]/;

const scrapePolicySections = async (url) => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto("https://explore.usableprivacy.org/twitch.tv/?view=machine",
            {waitUntil: 'networkidle2'});

        const sections_list = await page.evaluate((page) => {
            const sections_node_list = document.querySelectorAll('.highlighted');
            const sections = [...sections_node_list];
            
            return sections.map(section => {
                return {sectionOuter: section.outerHTML,
                        sectionText: section.textContent};
            });
        });

        await browser.close();

        return sections_list;
    } catch (e) {
        console.log(e);
    }
}

const categorizePolicySections = (sections, sections_object) => {
    sections.map(section => {
        const section_color = section.sectionOuter.match(SECTION_COLOR_REGEX)[0];

        switch(section_color) {
            case SECTION_COLOR_CODES.FIRST_PARTY_COLLECTION_AND_USE:
                sections_object.FIRST_PARTY_COLLECTION_AND_USE.push({
                    sectionCategory: SECTION_CATEGORIES.FIRST_PARTY_COLLECTION_AND_USE,
                    sectionText: section.sectionText
                });
                break;
            case SECTION_COLOR_CODES.THIRD_PARTY_SHARING_AND_COLLECTION:
                sections_object.THIRD_PARTY_SHARING_AND_COLLECTION.push({
                    sectionCategory: SECTION_CATEGORIES.THIRD_PARTY_SHARING_AND_COLLECTION,
                    sectionText: section.sectionText
                });
                break;
            case SECTION_COLOR_CODES.USER_CHOICE_AND_CONTROL:
                sections_object.USER_CHOICE_AND_CONTROL.push({
                    sectionCategory: SECTION_CATEGORIES.USER_CHOICE_AND_CONTROL,
                    sectionText: section.sectionText
                });
                break;
            case SECTION_COLOR_CODES.USER_ACCESS_EDIT_AND_DELETION:
                sections_object.USER_ACCESS_EDIT_AND_DELETION.push({
                    sectionCategory: SECTION_CATEGORIES.USER_ACCESS_EDIT_AND_DELETION,
                    sectionText: section.sectionText
                });
                break;
            case SECTION_COLOR_CODES.DATA_RETENTION:
                sections_object.DATA_RETENTION.push({
                    sectionCategory: SECTION_CATEGORIES.DATA_RETENTION,
                    sectionText: section.sectionText
                });
                break;
            case SECTION_COLOR_CODES.DATA_SECURTIY:
                sections_object.DATA_SECURTIY.push({
                    sectionCategory: SECTION_CATEGORIES.DATA_SECURTIY,
                    sectionText: section.sectionText
                });
                break;
            case SECTION_COLOR_CODES.POLICY_CHANGE:
                sections_object.POLICY_CHANGE.push({
                    sectionCategory: SECTION_CATEGORIES.POLICY_CHANGE,
                    sectionText: section.sectionText
                });
                break;
            case SECTION_COLOR_CODES.DO_NOT_TRACK:
                sections_object.DO_NOT_TRACK.push({
                    sectionCategory: SECTION_CATEGORIES.DO_NOT_TRACK,
                    sectionText: section.sectionText
                });
                break;
            case SECTION_COLOR_CODES.INTERNATIONAL_AND_SPECIFIC_AUDIENCES:
                sections_object.INTERNATIONAL_AND_SPECIFIC_AUDIENCES.push({
                    sectionCategory: SECTION_CATEGORIES.INTERNATIONAL_AND_SPECIFIC_AUDIENCES,
                    sectionText: section.sectionText
                });
        }
    });
}

(async() => {
    const myArgs = process.argv.slice(2);
    const usablePrivacyUrl = myArgs[0];
    const outputFile = myArgs[1];

    const sections = await scrapePolicySections(usablePrivacyUrl);
    
    let sections_object = {
        FIRST_PARTY_COLLECTION_AND_USE: [],
        THIRD_PARTY_SHARING_AND_COLLECTION: [],
        USER_CHOICE_AND_CONTROL: [],
        USER_ACCESS_EDIT_AND_DELETION: [],
        DATA_RETENTION: [],
        DATA_SECURTIY: [],
        POLICY_CHANGE: [],
        DO_NOT_TRACK: [],
        INTERNATIONAL_AND_SPECIFIC_AUDIENCES: []
    }

    categorizePolicySections(sections, sections_object);

    console.log(sections_object);
    fs.writeFileSync(outputFile, JSON.stringify(sections_object), 'utf-8');
})()