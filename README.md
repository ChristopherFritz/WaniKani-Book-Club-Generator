# WaniKani Book Club Manager

## Starting a New Entry

When loading the HTML page, a blank entry is available.  Under "Series", enter a "Title", then click on "Save to Browser" or "Save to File" (depending on where you wish to save the entry).

## Populating Fields

All fields are optional unless specified as required.

### Series Fields

<details>
<summary>Series fields define information about a series.</summary>

`Title`: This is the name of the book or manga series.  Required.

`Emoji`: The emoji to show after the title at the end of the post title.

`Club`: The club the book/manga is being read in.

`Home thread`: The WaniKani forum thread ID of the home thread.  This may be used in a weekly thread template to link back to the home thread.

`Short date format`: The format to use for dates where a shorter date is preferred.

`Long date format`: The format to use for dates where a longer date is preferred.

`Chapter # prefix`: The prefix to show before a chapter number.

`Chapter # suffix`: The suffix to show after a chapter number.
</details>

### Volume Fields

#### Volume's Volume Fields

<details>
<summary>Volume fields define information about a volume in a series.</summary>

`Volume number`: The volume number of the volume.  Required.

`Thread`: The WaniKani forum thread ID of the volume thread.

`Volume template`: The name of the template to use for the volume thread.

`Weekly template`: The name of the template to use for the weekly thread/reply.

`Cover image`: The Markdown tag for the volume's cover image after it has been uploaded to the WaniKani forum.

`Vocabulary list:` The full URL to the vocabulary list.
</details>

#### Volume's Chapter Fields

<details>
<summary>Chapter fields define information about an individual chapter within a volume.</summary>

`Number`: The chapter number.  Required.

`Title`: The chapter's title.

`Remove`: Removes the chapter.
</details>

Currently chapters are required for generating a per-chapter vocabulary sheet.  In the future, a per-week vocabulary sheet option should be implemented at which time adding chapters will be completely optional.

#### Volume's Week Fields

<details>
<summary>Week fields define the weeks a book club is split across.</summary>

`Week`: The week number.  Required.

`Thread`: The WaniKani forum thread ID of the week's thread.

`Start date`: The start date for the week's reading.  Required.

`Chapters`: The chapter or chapters included in the week's reading.

`Start page`: The page number of the first page for the week's reading.

`End page`: The page number of the last page for the week's reading.

`Remove`: Removes the week.
</details>

Weeks are required, as the first week's start date is used as the volume's start date.

### Template Fields

Templates are required if you wish to use the *Copy Volume Thread* and *Copy Week Thread* buttons.

`Template name`: Name of the template.  Required.

`Template markdown`: Markdown with placeholders for club and weekly thread/replies.  Required.

### Vocabulary Fields

These fields are used for the *Copy Sheets Macro* button.

`Show title row`: When checked, if chapters and titles are set, they will appear as the first row of the vocabulary spreadsheet.

`Alternate row colors`: When checked, banding will be used for alternating row colurs on the vocabulary spreadsheet.

`Color unsure and unknown`: When checked, allows users to enter "unsure" in the note field to color a row yellow, or leave the English translation of a word blank to color a row red.

`Color page numbers`: When checked, page numbers are colored in pastel colors, with repeated page numbers sharing a color.  This allows a subtle visual grouping of vocabulary words from the same page.

## Template Placeholders

Templates use placeholders to insert text from a book/volume into a template's output.

### Volume thread template

<details>
<summary>These placeholders can be used in a volume thread template.</summary>

`{Book Title}`: Title of the book.  Note: For a series, this currently only supports one title for the whole series (such as manga volumes).

`{Cover Image}`: Markdown for the book cover.

`{Volume Number}`: Sequential number of the book volume.

`{Volume Start Date}`: Start date for reading the book.  Currently uses the format set in "Short Date Format".

`{Volume Start Timestamp}`:  Start date for reading the book as a Markdown `[date]`.

`{Club Level}`: Book club level.  One of: `abbc`, `bbc`, `ibc`, `abc`

`{Club Link}`: Address of the main book club thread.

`{Vocabulary List}`: Address of the vocabulary list.

`{Series Home Link}`: Address of the series book club home thread.  This is typically used for an offshoot club, and this may point either to the volume one home thread or a separate thread acting as the home thread for the series.
</details>

#### Volume thread weekly schedule

To repeat HTML/Markdown for a weekly schedule, enclose a single week's HTML/Markdown between `{Week}` and `{/Week}`.

<details>
<summary>Within these tags, a weekly schedule may additionally include these following placeholders.</summary>

`{Week Number}`: Week number of the week.

`{Week Start Date}`: Start date for the week's reading.  Currently uses the format set in "Short Date Format".

`{Week Start Timestamp}`: Start date for the week's reading as a Markdown `[date]`.

`{Start Page}`: Week's reading's starting page number.

`{End Page}`: Week's reading's ending page number.

`{Week Chapters}`: Chapter or chapters being read during the week.

`{Page Count}`: Number of pages included in week's reading.
</details>

### Weekly thread template

<details>
<summary>The following placeholders can be used in a weekly thread template.</summary>

`{Chapters}`: Chapter or chapters being read during the week.

`{Week Start Date}`: Start date for the week's reading.  Currently uses the format set in "Short Date Format".
</details>
