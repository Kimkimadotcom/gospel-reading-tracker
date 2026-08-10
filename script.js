/*
=====================================================
 Gospel Reading Tracker
 Version 1.0
 Main Application Logic

 Features:
 - 117 Chapter Bible Reading Plan
 - NRSV Reading Reference
 - Chapter Metadata
 - Progress Tracking
 - Notes
 - Favorite Verse
 - Search
 - Statistics
 - Reading Streak
 - Local Storage
 - Backup Export / Import
 - Light / Dark / System Theme
 - Chapter Details Modal
 - Completion Celebration
 - Offline Service Worker
=====================================================
*/

"use strict";

/* =====================================================
SUPABASE CONNECTION
===================================================== */

const SUPABASE_URL =
    "https://muamqqjvypegfysrftbz.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_m4hppbs_iadaT_Q2HLuadg_4CsgHjRf";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

/* =====================================================
SUPABASE FAVORITE VERSE STORAGE
===================================================== */

async function saveFavoriteVersesToSupabase() {

    try {

        if (!supabaseClient) {
            return;
        }

        const favoriteData = {};

        Object.entries(appData.chapters).forEach(
            ([chapterId, chapter]) => {

                if (
                    chapter &&
                    Array.isArray(chapter.favoriteVerses) &&
                    chapter.favoriteVerses.length > 0
                ) {

                    favoriteData[chapterId] =
                        chapter.favoriteVerses;

                }

            }
        );

        const { data: existingRow, error: readError } =
            await supabaseClient
                .from("user_data")
                .select("data")
                .eq("id", 1)
                .maybeSingle();

        if (readError) {

            console.error(
                "Unable to read existing Supabase data:",
                readError
            );

            return;

        }

        const existingData =
            existingRow &&
                existingRow.data &&
                typeof existingRow.data === "object"
                ? existingRow.data
                : {};

        const updatedData = {
            ...existingData,
            favoriteVerses: favoriteData
        };

        const { error } =
            await supabaseClient
                .from("user_data")
                .update({
                    data: updatedData
                })
                .eq("id", 1);

        if (error) {

            console.error(
                "Unable to save favorite verses to Supabase:",
                error
            );

            return;

        }

        console.log(
            "Favorite verses saved to Supabase."
        );

    }

    catch (error) {

        console.error(
            "Supabase favorite verse save failed:",
            error
        );

    }

}

/* =====================================================
LOAD FAVORITE VERSES FROM SUPABASE
===================================================== */

async function loadFavoriteVersesFromSupabase() {

    try {

        if (!supabaseClient) {
            return;
        }


        const { data, error } =
            await supabaseClient
                .from("user_data")
                .select("data")
                .eq("id", 1)
                .maybeSingle();


        if (error) {

            console.error(
                "Unable to load favorite verses from Supabase:",
                error
            );

            return;

        }


        if (
            !data ||
            !data.data ||
            !data.data.favoriteVerses
        ) {

            return;

        }


        const savedFavorites =
            data.data.favoriteVerses;


        Object.entries(
            savedFavorites
        ).forEach(
            ([chapterId, favorites]) => {

                if (
                    !appData.chapters[chapterId]
                ) {

                    return;

                }


                if (
                    !Array.isArray(favorites)
                ) {

                    return;

                }


                appData.chapters[
                    chapterId
                ].favoriteVerses =
                    favorites;

            }
        );


        saveData();


        console.log(
            "Favorite verses loaded from Supabase."
        );


        renderReadingPlan(
            searchInput
                ? searchInput.value
                : ""
        );


    }

    catch (error) {

        console.error(
            "Supabase favorite verse loading failed:",
            error
        );

    }

}
/* =====================================================
APPLICATION CONSTANTS
===================================================== */

const TOTAL_CHAPTERS = 117;

const STORAGE_KEY =
    "GospelReadingTrackerData";

const BOOK_METADATA_FILES = [
    {
        name: "John",
        file: "john.json"
    },
    {
        name: "Mark",
        file: "mark.json"
    },
    {
        name: "Matthew",
        file: "matthew.json"
    },
    {
        name: "Luke",
        file: "luke.json"
    },
    {
        name: "Acts",
        file: "acts.json"
    }
];

/* =====================================================
   READING PLAN
===================================================== */

let readingPlan = [];

let bookMetadata = {};

let metadataLoaded = false;


/* =====================================================
   APPLICATION STATE
===================================================== */

let appData = {

    chapters: {},

    theme: "system"

};


/* =====================================================
   CHAPTER MODAL STATE
===================================================== */

let selectedChapterId = null;

let previouslyFocusedElement = null;


/* =====================================================
   DOM ELEMENTS
===================================================== */

const readingList =
    document.getElementById(
        "readingList"
    );


const statisticsContainer =
    document.getElementById(
        "statisticsContainer"
    );


const searchInput =
    document.getElementById(
        "searchInput"
    );


const chapterModal =
    document.getElementById(
        "chapterModal"
    );


const chapterModalTitle =
    document.getElementById(
        "chapterModalTitle"
    );


const chapterCompletionStatus =
    document.getElementById(
        "chapterCompletionStatus"
    );


const favoriteVersesContainer =
    document.getElementById(
        "favoriteVersesContainer"
    );

const favoriteVerseInput =
    document.getElementById(
        "favoriteVerseInput"
    );

const favoritePassageInput =
    document.getElementById(
        "favoritePassageInput"
    );

const addFavoriteVerseButton =
    document.getElementById(
        "addFavoriteVerseButton"
    );


const chapterNotesInput =
    document.getElementById(
        "chapterNotes"
    );


const saveChapterDetailsButton =
    document.getElementById(
        "saveChapterDetails"
    );


const closeChapterModalButton =
    document.getElementById(
        "closeChapterModal"
    );


const importFile =
    document.getElementById(
        "importFile"
    );


const exportButton =
    document.getElementById(
        "exportData"
    );


const importButton =
    document.getElementById(
        "importData"
    );


const themeToggle =
    document.getElementById(
        "themeToggle"
    );


const restartButton =
    document.getElementById(
        "restartTracker"
    );


const completionOverlay =
    document.getElementById(
        "completionOverlay"
    );


/* =====================================================
   SAFE DOM HELPERS
===================================================== */

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent = value;

    }

}


function setWidth(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.style.width = value;

    }

}


/* =====================================================
   STORAGE
===================================================== */

function saveData() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(appData)
        );

    }

    catch (error) {

        console.error(
            "Unable to save application data:",
            error
        );

    }

}


function loadData() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!saved) {

            return;

        }


        const parsed =
            JSON.parse(saved);


        if (
            !parsed ||
            typeof parsed !== "object"
        ) {

            return;

        }


        if (
            !parsed.chapters ||
            typeof parsed.chapters !== "object"
        ) {

            parsed.chapters = {};

        }


        if (
            typeof parsed.theme !== "string"
        ) {

            parsed.theme = "system";

        }


        appData = parsed;

    }

    catch (error) {

        console.error(
            "Unable to load saved application data:",
            error
        );


        appData = {

            chapters: {},

            theme: "system"

        };

    }

}


/* =====================================================
   DATE HELPERS
===================================================== */

function getTodayStorageDate() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


function formatStorageDate(dateString) {

    if (!dateString) {

        return "";

    }


    const parts =
        dateString.split("-");


    if (parts.length !== 3) {

        return dateString;

    }


    const date =
        new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


function getDateOffset(
    dateString,
    days
) {

    const parts =
        dateString.split("-");


    if (parts.length !== 3) {

        return dateString;

    }


    const date =
        new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );


    date.setDate(
        date.getDate() + days
    );


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


/* =====================================================
   LOAD BIBLE PLAN
===================================================== */

async function loadBiblePlan() {

    try {

        const response =
            await fetch(
                "bible-plan.json",
                {
                    cache: "no-cache"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Bible plan could not be loaded (${response.status})`
            );

        }


        const data =
            await response.json();


        if (
            !data ||
            !Array.isArray(data.books)
        ) {

            throw new Error(
                "Invalid bible-plan.json format."
            );

        }


        readingPlan =
            data.books.map(
                book => ({

                    book: book.name,

                    chapters:
                        Number(
                            book.totalChapters
                        )

                })
            );


        await loadBookMetadata();


        createChapterDatabase();


        metadataLoaded = true;


        renderReadingPlan(
            searchInput
                ? searchInput.value
                : ""
        );


        updateDashboard();


        checkCompletion();

    }

    catch (error) {

        console.error(
            "Error loading Bible plan:",
            error
        );


        showApplicationError(
            "The reading plan could not be loaded. Please run the project through VS Code Live Server."
        );

    }

}


/* =====================================================
   LOAD BOOK METADATA
===================================================== */

async function loadBookMetadata() {

    const loadedBooks = {};


    const results =
        await Promise.all(
            BOOK_METADATA_FILES.map(
                async item => {

                    try {

                        const response =
                            await fetch(
                                item.file,
                                {
                                    cache:
                                        "no-cache"
                                }
                            );


                        if (!response.ok) {

                            throw new Error(
                                `${item.name} metadata returned ${response.status}`
                            );

                        }


                        const data =
                            await response.json();


                        if (
                            !data ||
                            !Array.isArray(
                                data.chapters
                            )
                        ) {

                            throw new Error(
                                `${item.name} metadata has an invalid format`
                            );

                        }


                        return {

                            name:
                                item.name,

                            data:
                                data

                        };

                    }

                    catch (error) {

                        console.error(
                            `Unable to load ${item.name} metadata:`,
                            error
                        );


                        return null;

                    }

                }
            )
        );


    results.forEach(
        result => {

            if (!result) {

                return;

            }


            loadedBooks[
                result.name
            ] = result.data;

        }
    );


    bookMetadata =
        loadedBooks;

}


/* =====================================================
   APPLICATION ERROR
===================================================== */

function showApplicationError(message) {

    if (!readingList) {

        return;

    }


    readingList.innerHTML = "";


    const errorCard =
        document.createElement(
            "div"
        );


    errorCard.className =
        "book-card";


    const heading =
        document.createElement(
            "h3"
        );


    heading.textContent =
        "Unable to load reading plan";


    const paragraph =
        document.createElement(
            "p"
        );


    paragraph.textContent =
        message;


    errorCard.appendChild(
        heading
    );


    errorCard.appendChild(
        paragraph
    );


    readingList.appendChild(
        errorCard
    );

}


/* =====================================================
   GET CHAPTER METADATA
===================================================== */

function getChapterMetadata(
    bookName,
    chapterNumber
) {

    const book =
        bookMetadata[bookName];


    if (!book) {

        return null;

    }


    return book.chapters.find(
        item =>
            Number(item.chapter) ===
            Number(chapterNumber)
    ) || null;

}


/* =====================================================
   CREATE CHAPTER DATABASE
===================================================== */

function createChapterDatabase() {

    readingPlan.forEach(
        book => {

            for (
                let chapter = 1;
                chapter <= book.chapters;
                chapter++
            ) {

                const id =
                    `${book.book}-${chapter}`;


                const metadata =
                    getChapterMetadata(
                        book.book,
                        chapter
                    );

                let existing =
                    appData.chapters[id];

                if (
                    !appData.chapters[id]
                ) {

                    appData.chapters[id] = {

                        book:
                            book.book,

                        chapter:
                            chapter,

                        verseCount:
                            metadata
                                ? Number(
                                    metadata.verses
                                )
                                : 0,

                        completed:
                            false,

                        completionDate:
                            null,

                        favoriteVerse:
                            [],

                        notes:
                            ""

                    };

                    existing =
                        appData.chapters[id];

                }

                else {

                    if (
                        typeof existing.book !==
                        "string"
                    ) {

                        existing.book =
                            book.book;

                    }


                    if (
                        typeof existing.chapter !==
                        "number"
                    ) {

                        existing.chapter =
                            chapter;

                    }


                    if (
                        typeof existing.completed !==
                        "boolean"
                    ) {

                        existing.completed =
                            false;

                    }


                    if (
                        !Object.prototype.hasOwnProperty.call(
                            existing,
                            "completionDate"
                        )
                    ) {

                        existing.completionDate =
                            null;

                    }


                    if (
                        !Object.prototype.hasOwnProperty.call(
                            existing,
                            "favoriteVerse"
                        )
                    ) {

                        existing.favoriteVerse =
                            "";

                    }


                    if (
                        !Object.prototype.hasOwnProperty.call(
                            existing,
                            "notes"
                        )
                    ) {

                        existing.notes =
                            "";

                    }


                    existing.verseCount =
                        metadata
                            ? Number(
                                metadata.verses
                            )
                            : Number(
                                existing.verseCount || 0
                            );

                }
                /*
Migrate the old single favoriteVerse
field into the new favoriteVerses array.
*/

                if (
                    !Array.isArray(
                        existing.favoriteVerses
                    )
                ) {

                    existing.favoriteVerses = [];

                }


                /*
                Keep old favoriteVerse data if it exists.
                This prevents previously saved data
                from being lost after the update.
                */

                if (
                    existing.favoriteVerse &&
                    typeof existing.favoriteVerse ===
                    "string" &&
                    existing.favoriteVerse.trim() !== ""
                ) {

                    const oldReference =
                        existing.favoriteVerse.trim();


                    const alreadyExists =
                        existing.favoriteVerses.some(
                            item =>
                                item &&
                                item.reference ===
                                oldReference
                        );


                    if (!alreadyExists) {

                        existing.favoriteVerses.push({

                            reference:
                                oldReference,

                            passage:
                                ""

                        });

                    }


                    delete existing.favoriteVerse;

                }

            }

        }
    );


    saveData();

}


/* =====================================================
   SEARCH TEXT
===================================================== */

function getChapterSearchText(
    book,
    chapterData
) {

    const chapterNumber =
        chapterData.chapter;


    const verseCount =
        chapterData.verseCount || 0;


    const favoriteVerses =
        Array.isArray(
            chapterData.favoriteVerses
        )
            ? chapterData.favoriteVerses
            : [];


    const notes =
        chapterData.notes || "";


    const metadata =
        getChapterMetadata(
            book.book,
            chapterNumber
        );


    let metadataText = "";


    if (metadata) {

        metadataText =
            JSON.stringify(
                metadata
            );

    }


    return [
        book.book,
        `chapter ${chapterNumber}`,
        `${book.book} ${chapterNumber}`,
        `${book.book} ${chapterNumber}:1`,
        `${book.book} ${chapterNumber}:${verseCount}`,
        favoriteVerses
            .map(
                item =>
                    `${item.reference || ""} ${item.passage || ""}`
            )
            .join(" "),
        notes,
        metadataText
    ]
        .join(" ")
        .toLowerCase();

}


/* =====================================================
   RENDER READING PLAN
===================================================== */

function renderReadingPlan(
    search = ""
) {

    if (!readingList) {

        return;

    }


    readingList.innerHTML = "";


    const normalizedSearch =
        search
            .trim()
            .toLowerCase();


    let visibleChapterCount = 0;


    readingPlan.forEach(
        book => {

            const bookBox =
                document.createElement(
                    "div"
                );


            bookBox.className =
                "book-card";


            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                book.book;


            bookBox.appendChild(
                title
            );


            let bookHasVisibleChapters =
                false;


            for (
                let chapter = 1;
                chapter <= book.chapters;
                chapter++
            ) {

                const id =
                    `${book.book}-${chapter}`;


                const chapterData =
                    appData.chapters[id];


                if (!chapterData) {

                    continue;

                }


                const searchText =
                    getChapterSearchText(
                        book,
                        chapterData
                    );


                if (
                    normalizedSearch &&
                    !searchText.includes(
                        normalizedSearch
                    )
                ) {

                    continue;

                }


                bookHasVisibleChapters =
                    true;


                visibleChapterCount++;


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "chapter-card";


                if (
                    chapterData.completed
                ) {

                    card.classList.add(
                        "completed"
                    );

                }


                const information =
                    document.createElement(
                        "div"
                    );


                const titleElement =
                    document.createElement(
                        "strong"
                    );


                titleElement.textContent =
                    `${book.book} Chapter ${chapter}`;


                information.appendChild(
                    titleElement
                );


                if (
                    chapterData.verseCount
                ) {

                    const verseCount =
                        document.createElement(
                            "small"
                        );


                    verseCount.textContent =
                        `${chapterData.verseCount} verses`;


                    information.appendChild(
                        document.createElement(
                            "br"
                        )
                    );


                    information.appendChild(
                        verseCount
                    );

                }


                if (
                    chapterData.completed &&
                    chapterData.completionDate
                ) {

                    const completion =
                        document.createElement(
                            "small"
                        );


                    completion.textContent =
                        `Completed: ${formatStorageDate(
                            chapterData.completionDate
                        )}`;


                    information.appendChild(
                        document.createElement(
                            "br"
                        )
                    );


                    information.appendChild(
                        completion
                    );

                }

                const checkbox =
                    document.createElement(
                        "input"
                    );


                checkbox.type =
                    "checkbox";


                checkbox.checked =
                    chapterData.completed;


                checkbox.setAttribute(
                    "aria-label",
                    `Mark ${book.book} Chapter ${chapter} as complete`
                );


                checkbox.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                    }
                );


                checkbox.addEventListener(
                    "change",
                    () => {

                        toggleChapter(id);

                    }
                );


                card.appendChild(
                    information
                );


                card.appendChild(
                    checkbox
                );


                card.setAttribute(
                    "role",
                    "button"
                );


                card.setAttribute(
                    "tabindex",
                    "0"
                );


                card.setAttribute(
                    "aria-label",
                    `Open details for ${book.book} Chapter ${chapter}`
                );


                card.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            checkbox
                        ) {

                            return;

                        }


                        openChapterDetails(
                            id
                        );

                    }
                );


                card.addEventListener(
                    "keydown",
                    event => {

                        if (
                            event.key ===
                            "Enter" ||
                            event.key ===
                            " "
                        ) {

                            event.preventDefault();


                            openChapterDetails(
                                id
                            );

                        }

                    }
                );


                bookBox.appendChild(
                    card
                );

            }


            if (
                bookHasVisibleChapters
            ) {

                readingList.appendChild(
                    bookBox
                );

            }

        }
    );


    if (
        normalizedSearch &&
        visibleChapterCount === 0
    ) {

        const noResults =
            document.createElement(
                "div"
            );


        noResults.className =
            "book-card";


        noResults.textContent =
            "No matching chapters found.";


        readingList.appendChild(
            noResults
        );

    }

}


/* =====================================================
   COMPLETE / UNCOMPLETE CHAPTER
===================================================== */

function toggleChapter(id) {

    const chapter =
        appData.chapters[id];


    if (!chapter) {

        return;

    }


    chapter.completed =
        !chapter.completed;


    if (
        chapter.completed
    ) {

        chapter.completionDate =
            getTodayStorageDate();

    }

    else {

        chapter.completionDate =
            null;

    }


    saveData();


    updateDashboard();


    renderReadingPlan(
        searchInput
            ? searchInput.value
            : ""
    );


    checkCompletion();

}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const chapters =
        Object.values(
            appData.chapters
        );


    const completed =
        chapters.filter(
            chapter =>
                chapter.completed
        ).length;


    const remaining =
        Math.max(
            0,
            TOTAL_CHAPTERS -
            completed
        );


    const percent =
        Math.round(
            completed /
            TOTAL_CHAPTERS *
            100
        );


    setText(
        "completedCount",
        completed
    );


    setText(
        "remainingCount",
        remaining
    );


    setText(
        "overallPercent",
        `${percent}%`
    );


    setWidth(
        "overallProgress",
        `${percent}%`
    );


    updateCurrentReading();

    updateStatistics();

    updateStreak();

}


/* =====================================================
   CURRENT READING
===================================================== */

function updateCurrentReading() {

    let nextChapter = null;


    for (
        const book of readingPlan
    ) {

        for (
            let chapter = 1;
            chapter <= book.chapters;
            chapter++
        ) {

            const item =
                appData.chapters[
                `${book.book}-${chapter}`
                ];


            if (
                item &&
                !item.completed
            ) {

                nextChapter =
                    item;

                break;

            }

        }


        if (nextChapter) {

            break;

        }

    }


    if (nextChapter) {

        setText(
            "currentBook",
            nextChapter.book
        );


        setText(
            "currentChapter",
            nextChapter.chapter
        );


        setText(
            "todayReading",
            `${nextChapter.book} ${nextChapter.chapter}`
        );

    }

    else {

        setText(
            "currentBook",
            "Completed"
        );


        setText(
            "currentChapter",
            "—"
        );


        setText(
            "todayReading",
            "All chapters completed"
        );

    }


    const completed =
        Object.values(
            appData.chapters
        )
            .filter(
                item =>
                    item.completed &&
                    item.completionDate
            )
            .sort(
                (a, b) =>
                    a.completionDate.localeCompare(
                        b.completionDate
                    )
            );


    const last =
        completed[
        completed.length - 1
        ];


    setText(
        "lastCompleted",
        last
            ? `${last.book} ${last.chapter}`
            : "None"
    );

}


/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics() {

    if (!statisticsContainer) {

        return;

    }


    statisticsContainer.innerHTML =
        "";


    readingPlan.forEach(
        book => {

            const completed =
                Object.values(
                    appData.chapters
                )
                    .filter(
                        item =>
                            item.book ===
                            book.book &&
                            item.completed
                    )
                    .length;


            const percent =
                Math.round(
                    completed /
                    book.chapters *
                    100
                );


            const box =
                document.createElement(
                    "div"
                );


            box.className =
                "statistics-card";


            const title =
                document.createElement(
                    "strong"
                );


            title.textContent =
                book.book;


            const count =
                document.createElement(
                    "p"
                );


            count.textContent =
                `${completed}/${book.chapters} chapters`;


            const track =
                document.createElement(
                    "div"
                );


            track.className =
                "progress-track";


            const value =
                document.createElement(
                    "div"
                );


            value.className =
                "progress-value";


            value.style.width =
                `${percent}%`;


            track.appendChild(
                value
            );


            box.appendChild(
                title
            );


            box.appendChild(
                count
            );


            box.appendChild(
                track
            );


            statisticsContainer.appendChild(
                box
            );

        }
    );

}


/* =====================================================
   READING STREAK
===================================================== */

function updateStreak() {

    const dates =
        Object.values(
            appData.chapters
        )
            .filter(
                item =>
                    item.completed &&
                    item.completionDate
            )
            .map(
                item =>
                    item.completionDate
            );


    const uniqueDates =
        [
            ...new Set(dates)
        ]
            .sort(
                (a, b) =>
                    b.localeCompare(a)
            );


    if (
        uniqueDates.length === 0
    ) {

        setText(
            "readingStreak",
            "0"
        );

        return;

    }


    const today =
        getTodayStorageDate();


    const yesterday =
        getDateOffset(
            today,
            -1
        );


    const latestDate =
        uniqueDates[0];


    /*
    A streak is active only when the
    latest reading happened today or
    yesterday.
    */

    if (
        latestDate !== today &&
        latestDate !== yesterday
    ) {

        setText(
            "readingStreak",
            "0"
        );

        return;

    }


    let streak = 1;


    for (
        let index = 1;
        index < uniqueDates.length;
        index++
    ) {

        const previousDate =
            uniqueDates[
            index - 1
            ];


        const currentDate =
            uniqueDates[
            index
            ];


        const expectedDate =
            getDateOffset(
                previousDate,
                -1
            );


        if (
            currentDate ===
            expectedDate
        ) {

            streak++;

        }

        else {

            break;

        }

    }


    setText(
        "readingStreak",
        streak
    );

}


/* =====================================================
   SEARCH
===================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        event => {

            renderReadingPlan(
                event.target.value
            );

        }
    );

}


/* =====================================================
   EXPORT BACKUP
===================================================== */

if (exportButton) {

    exportButton.addEventListener(
        "click",
        () => {

            try {

                const backup = {

                    app:
                        "Gospel Reading Tracker",

                    version:
                        "1.0",

                    exportedAt:
                        new Date()
                            .toISOString(),

                    data:
                        appData

                };


                const json =
                    JSON.stringify(
                        backup,
                        null,
                        2
                    );


                const file =
                    new Blob(
                        [json],
                        {
                            type:
                                "application/json"
                        }
                    );


                const url =
                    URL.createObjectURL(
                        file
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    url;


                link.download =
                    "Gospel-Reading-Backup.json";


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                setTimeout(
                    () => {

                        URL.revokeObjectURL(
                            url
                        );

                    },
                    1000
                );

            }

            catch (error) {

                console.error(
                    "Backup export failed:",
                    error
                );

                window.alert(
                    "The backup could not be exported."
                );

            }

        }
    );

}


/* =====================================================
   IMPORT BACKUP
===================================================== */

if (
    importButton &&
    importFile
) {

    importButton.addEventListener(
        "click",
        () => {

            importFile.click();

        }
    );


    importFile.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                () => {

                    try {

                        const imported =
                            JSON.parse(
                                reader.result
                            );


                        const restoredData =
                            extractBackupData(
                                imported
                            );


                        if (
                            !validateBackupData(
                                restoredData
                            )
                        ) {

                            throw new Error(
                                "Invalid backup structure."
                            );

                        }


                        appData =
                            restoredData;


                        createChapterDatabase();


                        applyTheme();


                        renderReadingPlan();


                        updateDashboard();


                        checkCompletion();


                    }

                    catch (error) {

                        console.error(
                            "Backup import failed:",
                            error
                        );


                        window.alert(
                            "This backup file is not valid."
                        );

                    }

                    finally {

                        importFile.value =
                            "";

                    }

                };


            reader.onerror =
                () => {

                    window.alert(
                        "The backup file could not be read."
                    );


                    importFile.value =
                        "";

                };


            reader.readAsText(
                file
            );

        }
    );

}


/* =====================================================
   BACKUP DATA EXTRACTION
===================================================== */

function extractBackupData(data) {

    if (
        data &&
        data.data &&
        typeof data.data === "object"
    ) {

        return data.data;

    }


    return data;

}


/* =====================================================
   BACKUP VALIDATION
===================================================== */
function validateBackupData(data) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        return false;

    }


    if (
        !data.chapters ||
        typeof data.chapters !== "object"
    ) {

        return false;

    }


    for (
        const chapter
        of Object.values(
            data.chapters
        )
    ) {

        if (
            !chapter ||
            typeof chapter !== "object"
        ) {

            return false;

        }


        if (
            typeof chapter.book !==
            "string"
        ) {

            return false;

        }


        if (
            typeof chapter.chapter !==
            "number"
        ) {

            return false;

        }


        if (
            typeof chapter.completed !==
            "boolean"
        ) {

            return false;

        }


        /*
        Favorite verses are optional.
        When present, they must be
        stored as an array.
        */

        if (
            Object.prototype.hasOwnProperty.call(
                chapter,
                "favoriteVerses"
            ) &&
            !Array.isArray(
                chapter.favoriteVerses
            )
        ) {

            return false;

        }


        /*
        Validate each favorite verse.
        */

        if (
            Array.isArray(
                chapter.favoriteVerses
            )
        ) {

            for (
                const favorite
                of chapter.favoriteVerses
            ) {

                if (
                    !favorite ||
                    typeof favorite !==
                    "object"
                ) {

                    return false;

                }


                if (
                    typeof favorite.reference !==
                    "string"
                ) {

                    return false;

                }


                if (
                    typeof favorite.passage !==
                    "string"
                ) {

                    favorite.passage =
                        "";

                }

            }

        }

    }


    if (
        typeof data.theme !==
        "string"
    ) {

        data.theme =
            "system";

    }


    return true;

}

/* =====================================================
   THEME
===================================================== */

function applyTheme() {

    const savedTheme =
        appData.theme || "dark";


    if (savedTheme === "light") {

        document.body.classList.remove("dark");

    }

    else {

        document.body.classList.add("dark");

    }

}

if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        () => {

            const isDark =
                document.body.classList.contains(
                    "dark"
                );


            appData.theme =
                isDark
                    ? "light"
                    : "dark";


            applyTheme();


            saveData();

        }
    );

}


if (
    window.matchMedia
) {

    const mediaQuery =
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        );


    const handleSystemThemeChange =
        () => {

            if (
                appData.theme ===
                "system"
            ) {

                applyTheme();

            }

        };


    if (
        typeof mediaQuery.addEventListener ===
        "function"
    ) {

        mediaQuery.addEventListener(
            "change",
            handleSystemThemeChange
        );

    }

    else if (
        typeof mediaQuery.addListener ===
        "function"
    ) {

        mediaQuery.addListener(
            handleSystemThemeChange
        );

    }

}


/* =====================================================
   CHAPTER DETAILS MODAL
===================================================== */

function openChapterDetails(id) {

    const chapter =
        appData.chapters[id];


    if (
        !chapter ||
        !chapterModal
    ) {

        return;

    }


    selectedChapterId =
        id;


    previouslyFocusedElement =
        document.activeElement;


    if (chapterModalTitle) {

        chapterModalTitle.textContent =
            `${chapter.book} Chapter ${chapter.chapter}`;

    }


    if (chapterCompletionStatus) {

        if (
            chapter.completed &&
            chapter.completionDate
        ) {

            chapterCompletionStatus.textContent =
                `Completed on ${formatStorageDate(
                    chapter.completionDate
                )}`;

        }

        else {

            chapterCompletionStatus.textContent =
                "Not completed yet";

        }

    }


    if (chapterNotesInput) {

        chapterNotesInput.value =
            chapter.notes ||
            "";

    }

    renderFavoriteVerses();


    /*
    Make the modal interactive before
    making it visible.
    */

    chapterModal.inert =
        false;


    chapterModal.classList.add(
        "active"
    );


    chapterModal.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
    Move focus into the modal after
    it becomes visible.
    */

    requestAnimationFrame(
        () => {

            if (
                closeChapterModalButton
            ) {

                closeChapterModalButton.focus();

            }

        }
    );

}


function closeChapterDetails() {

    if (!chapterModal) {

        return;

    }


    /*
    Store the element that should regain
    focus after the modal closes.
    */

    const returnFocusElement =
        previouslyFocusedElement;


    /*
    Remove focus from the modal BEFORE
    setting aria-hidden to true.

    This prevents the browser warning:
    "Blocked aria-hidden on an element
    because its descendant retained focus."
    */

    if (
        document.activeElement &&
        chapterModal.contains(
            document.activeElement
        )
    ) {

        document.activeElement.blur();

    }


    /*
    Make the modal inert before hiding it.
    */

    chapterModal.inert =
        true;


    /*
    Remove visible state.
    */

    chapterModal.classList.remove(
        "active"
    );


    /*
    Only now hide it from assistive
    technology.
    */

    chapterModal.setAttribute(
        "aria-hidden",
        "true"
    );


    selectedChapterId =
        null;


    previouslyFocusedElement =
        null;


    /*
    Restore focus to the element that
    opened the modal.
    */

    if (
        returnFocusElement &&
        returnFocusElement !==
        chapterModal &&
        !chapterModal.contains(
            returnFocusElement
        ) &&
        typeof returnFocusElement.focus ===
        "function" &&
        document.contains(
            returnFocusElement
        )
    ) {

        requestAnimationFrame(
            () => {

                returnFocusElement.focus();

            }
        );

    }

}

/* =====================================================
FAVORITE VERSE SYSTEM
===================================================== */

function getFavoriteVerses(chapter) {

    if (
        !chapter ||
        !Array.isArray(
            chapter.favoriteVerses
        )
    ) {

        return [];

    }


    return chapter.favoriteVerses;

}


function renderFavoriteVerses() {

    if (
        !favoriteVersesContainer ||
        !selectedChapterId
    ) {

        return;

    }


    const chapter =
        appData.chapters[
        selectedChapterId
        ];


    if (!chapter) {

        return;

    }


    const favoriteVerses =
        getFavoriteVerses(
            chapter
        );


    favoriteVersesContainer.innerHTML =
        "";


    if (
        favoriteVerses.length === 0
    ) {

        const emptyMessage =
            document.createElement(
                "p"
            );


        emptyMessage.textContent =
            "No favorite verses added yet.";


        emptyMessage.className =
            "favorite-verses-empty";


        favoriteVersesContainer.appendChild(
            emptyMessage
        );


        return;

    }


    favoriteVerses.forEach(
        (favorite, index) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "favorite-verse-item";


            /* =========================
               VERSE REFERENCE
               ========================= */

            const reference =
                document.createElement(
                    "strong"
                );


            reference.textContent =
                favorite.reference ||
                "";


            /* =========================
               PASSAGE INPUT
               ========================= */

            const passage =
                document.createElement(
                    "textarea"
                );


            passage.className =
                "chapter-notes favorite-passage-input";


            passage.rows =
                3;


            passage.value =
                favorite.passage ||
                "";


            passage.placeholder =
                "Enter passage or your reflection...";


            passage.addEventListener(
                "change",
                () => {

                    updateFavoritePassage(
                        index,
                        passage.value
                    );

                }
            );


            /* =========================
               REMOVE BUTTON
               ========================= */

            const removeButton =
                document.createElement(
                    "button"
                );


            removeButton.type =
                "button";


            removeButton.className =
                "action-button secondary";


            removeButton.textContent =
                "Remove";


            removeButton.addEventListener(
                "click",
                () => {

                    const confirmed =
                        window.confirm(
                            `Remove ${favorite.reference}?`
                        );


                    if (!confirmed) {

                        return;

                    }


                    removeFavoriteVerse(
                        index
                    );


                    renderFavoriteVerses();

                }
            );


            /* =========================
               ADD ELEMENTS
               ========================= */

            item.appendChild(
                reference
            );


            item.appendChild(
                passage
            );


            item.appendChild(
                removeButton
            );


            favoriteVersesContainer.appendChild(
                item
            );

        }
    );

}

function addFavoriteVerse(
    reference,
    passage
) {

    if (
        !selectedChapterId
    ) {

        return false;

    }


    const chapter =
        appData.chapters[
        selectedChapterId
        ];


    if (!chapter) {

        return false;

    }


    const cleanReference =
        String(
            reference || ""
        ).trim();


    const cleanPassage =
        String(
            passage || ""
        ).trim();


    if (
        !cleanReference
    ) {

        return false;

    }


    if (
        !Array.isArray(
            chapter.favoriteVerses
        )
    ) {

        chapter.favoriteVerses =
            [];

    }


    const duplicate =
        chapter.favoriteVerses.some(
            item =>
                item &&
                String(
                    item.reference || ""
                ).toLowerCase() ===
                cleanReference.toLowerCase()
        );


    if (duplicate) {

        return false;

    }


    chapter.favoriteVerses.push({

        reference:
            cleanReference,

        passage:
            cleanPassage

    });


    saveData();

    saveFavoriteVersesToSupabase();

    renderReadingPlan(
        searchInput
            ? searchInput.value
            : ""
    );


    return true;

}

if (
    addFavoriteVerseButton
) {

    addFavoriteVerseButton.addEventListener(
        "click",
        () => {

            const reference =
                favoriteVerseInput
                    ? favoriteVerseInput.value.trim()
                    : "";


            const passage =
                favoritePassageInput
                    ? favoritePassageInput.value.trim()
                    : "";


            if (!reference) {

                window.alert(
                    "Please enter a favorite verse reference."
                );

                if (favoriteVerseInput) {

                    favoriteVerseInput.focus();

                }

                return;

            }


            const added =
                addFavoriteVerse(
                    reference,
                    passage
                );


            if (!added) {

                window.alert(
                    "This favorite verse is already saved."
                );

                return;

            }


            if (favoriteVerseInput) {

                favoriteVerseInput.value =
                    "";

            }


            if (favoritePassageInput) {

                favoritePassageInput.value =
                    "";

            }


            renderFavoriteVerses();

        }
    );

}


/* =====================================================
REMOVE FAVORITE VERSE
===================================================== */

function removeFavoriteVerse(
    index
) {

    if (
        !selectedChapterId
    ) {

        return;

    }


    const chapter =
        appData.chapters[
        selectedChapterId
        ];


    if (
        !chapter ||
        !Array.isArray(
            chapter.favoriteVerses
        )
    ) {

        return;

    }


    if (
        index < 0 ||
        index >=
        chapter.favoriteVerses.length
    ) {

        return;

    }


    chapter.favoriteVerses.splice(
        index,
        1
    );


    saveData();

    saveFavoriteVersesToSupabase();

    renderReadingPlan(
        searchInput
            ? searchInput.value
            : ""
    );

}



/* =====================================================
UPDATE FAVORITE PASSAGE
===================================================== */

function updateFavoritePassage(
    index,
    passage
) {

    if (
        !selectedChapterId
    ) {

        return;

    }


    const chapter =
        appData.chapters[
        selectedChapterId
        ];


    if (
        !chapter ||
        !Array.isArray(
            chapter.favoriteVerses
        )
    ) {

        return;

    }


    if (
        !chapter.favoriteVerses[index]
    ) {

        return;

    }


    chapter.favoriteVerses[
        index
    ].passage =
        String(
            passage || ""
        ).trim();


    saveData();

    saveFavoriteVersesToSupabase();

    renderReadingPlan(
        searchInput
            ? searchInput.value
            : ""
    );
}
/* =====================================================
   SAVE CHAPTER DETAILS
===================================================== */

if (
    saveChapterDetailsButton
) {

    saveChapterDetailsButton.addEventListener(
        "click",
        () => {

            if (
                !selectedChapterId
            ) {

                return;

            }


            const chapter =
                appData.chapters[
                selectedChapterId
                ];


            if (!chapter) {

                return;

            }

            if (
                chapterNotesInput
            ) {

                chapter.notes =
                    chapterNotesInput
                        .value
                        .trim();

            }


            saveData();


            renderReadingPlan(
                searchInput
                    ? searchInput.value
                    : ""
            );


            closeChapterDetails();

        }
    );

}


/* =====================================================
   CLOSE MODAL BUTTON
===================================================== */

if (
    closeChapterModalButton
) {

    closeChapterModalButton.addEventListener(
        "click",
        () => {

            closeChapterDetails();

        }
    );

}


/* =====================================================
   MODAL BACKDROP
===================================================== */

if (chapterModal) {

    /*
    The modal starts inactive and inert.
    */

    chapterModal.inert =
        true;


    chapterModal.setAttribute(
        "aria-hidden",
        "true"
    );


    chapterModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                chapterModal
            ) {

                closeChapterDetails();

            }

        }
    );

}


/* =====================================================
   ESCAPE KEY
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            chapterModal &&
            chapterModal.classList.contains(
                "active"
            )
        ) {

            closeChapterDetails();

        }

    }
);


/* =====================================================
   COMPLETION SYSTEM
===================================================== */

function checkCompletion() {

    if (
        !completionOverlay
    ) {

        return;

    }


    const chapters =
        Object.values(
            appData.chapters
        );


    if (
        chapters.length !==
        TOTAL_CHAPTERS
    ) {

        completionOverlay.style.display =
            "none";

        return;

    }


    const finished =
        chapters.every(
            item =>
                item.completed
        );


    if (finished) {

        completionOverlay.style.display =
            "flex";


        startConfetti();

    }

    else {

        completionOverlay.style.display =
            "none";

    }

}


/* =====================================================
   RESTART TRACKER
===================================================== */

if (restartButton) {

    restartButton.addEventListener(
        "click",
        () => {

            const confirmed =
                window.confirm(
                    "Restart the entire reading tracker? Your chapter notes and favorite verses will be kept."
                );


            if (!confirmed) {

                return;

            }


            Object.values(
                appData.chapters
            )
                .forEach(
                    chapter => {

                        chapter.completed =
                            false;


                        chapter.completionDate =
                            null;

                    }
                );


            saveData();


            if (
                completionOverlay
            ) {

                completionOverlay.style.display =
                    "none";

            }


            stopConfetti();


            updateDashboard();


            renderReadingPlan(
                searchInput
                    ? searchInput.value
                    : ""
            );

        }
    );

}


/* =====================================================
   CONFETTI
===================================================== */

let confettiAnimationFrame =
    null;

let confettiParticles = [];


function startConfetti() {

    const canvas =
        document.getElementById(
            "confettiCanvas"
        );


    if (!canvas) {

        return;

    }


    const context =
        canvas.getContext(
            "2d"
        );


    if (!context) {

        return;

    }


    resizeConfettiCanvas(
        canvas
    );


    confettiParticles =
        createConfettiParticles(
            canvas,
            120
        );


    if (
        confettiAnimationFrame
    ) {

        cancelAnimationFrame(
            confettiAnimationFrame
        );

    }


    function animate() {

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        confettiParticles.forEach(
            particle => {

                particle.y +=
                    particle.speed;


                particle.rotation +=
                    particle.rotationSpeed;


                particle.x +=
                    particle.drift;


                if (
                    particle.y >
                    canvas.height + 20
                ) {

                    particle.y =
                        -20;

                    particle.x =
                        Math.random() *
                        canvas.width;

                }


                context.save();


                context.translate(
                    particle.x,
                    particle.y
                );


                context.rotate(
                    particle.rotation
                );


                context.fillStyle =
                    particle.color;


                context.fillRect(
                    -particle.size / 2,
                    -particle.size / 2,
                    particle.size,
                    particle.size
                );


                context.restore();

            }
        );


        confettiAnimationFrame =
            requestAnimationFrame(
                animate
            );

    }


    animate();

}


function stopConfetti() {

    if (
        confettiAnimationFrame
    ) {

        cancelAnimationFrame(
            confettiAnimationFrame
        );

        confettiAnimationFrame =
            null;

    }


    confettiParticles =
        [];


    const canvas =
        document.getElementById(
            "confettiCanvas"
        );


    if (!canvas) {

        return;

    }


    const context =
        canvas.getContext(
            "2d"
        );


    if (!context) {

        return;

    }


    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

}


function resizeConfettiCanvas(
    canvas
) {

    const rect =
        canvas.getBoundingClientRect();


    const devicePixelRatio =
        Math.min(
            window.devicePixelRatio ||
            1,
            2
        );


    canvas.width =
        Math.max(
            1,
            Math.round(
                rect.width *
                devicePixelRatio
            )
        );


    canvas.height =
        Math.max(
            1,
            Math.round(
                rect.height *
                devicePixelRatio
            )
        );

}


function createConfettiParticles(
    canvas,
    count
) {

    const colors = [
        "#007AFF",
        "#34C759",
        "#FF9500",
        "#FF3B30",
        "#AF52DE",
        "#5856D6"
    ];


    const particles = [];


    for (
        let index = 0;
        index < count;
        index++
    ) {

        particles.push({

            x:
                Math.random() *
                canvas.width,

            y:
                Math.random() *
                canvas.height,

            size:
                5 +
                Math.random() *
                7,

            speed:
                1.5 +
                Math.random() *
                3,

            drift:
                -0.8 +
                Math.random() *
                1.6,

            rotation:
                Math.random() *
                Math.PI,

            rotationSpeed:
                -0.08 +
                Math.random() *
                0.16,

            color:
                colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
                ]

        });

    }


    return particles;

}


window.addEventListener(
    "resize",
    () => {

        const canvas =
            document.getElementById(
                "confettiCanvas"
            );


        if (
            canvas &&
            completionOverlay &&
            completionOverlay.style.display ===
            "flex"
        ) {

            resizeConfettiCanvas(
                canvas
            );

        }

    }
);

loadData();

applyTheme();

loadBiblePlan().then(() => {

    loadFavoriteVersesFromSupabase();

});

