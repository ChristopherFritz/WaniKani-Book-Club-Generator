# WaniKani Book Club Manager

## Template Placeholders

### Volume thread template

The following placeholders can be used in a **volume thread** template:

`{Book Title}`: Title of the book.  Note: For a series, this currently only supports one title for the whole series (such as manga volumes).

`{Cover Image}`: Markdown for the book cover.

`{Volume Number}`: Sequential number of the book volume.

`{Volume Start Date}`: Start date for reading the book.  Currently uses the format set in "Short Date Format".

`{Volume Start Timestamp}`:  Start date for reading the book as a Markdown `[date]`.

`{Club Level}`: Book club level.  One of: `abbc`, `bbc`, `ibc`, `abc`

`{Club Link}`: Address of the main book club thread.

`{Vocabulary List}`: Address of the vocabulary list.

`{Series Home Link}`: Address of the series book club home thread.  This is typically used for an offshoot club, and this may point either to the volume one home thread or a separate thread acting as the home thread for the series.

#### Volume thread weekly schedule

To repeat HTML/Markdown for a weekly schedule, enclose a single week's HTML/Markdown between `{Week}` and `{/Week}`.

Within these tags, a weekly schedule may additionally include the following placeholders:

`{Week Number}`: Week number of the week.

`{Week Start Date}`: Start date for the week's reading.  Currently uses the format set in "Short Date Format".

`{Week Start Timestamp}`: Start date for the week's reading as a Markdown `[date]`.

`{Start Page}`: Week's reading's starting page number.

`{End Page}`: Week's reading's ending page number.

`{Week Chapters}`: Chapter or chapters being read during the week.

`{Page Count}`: Number of pages included in week's reading.

### Weekly thread template

The following placeholders can be used in a **weekly thread** template:

`{Chapters}`: Chapter or chapters being read during the week.

`{Week Start Date}`: Start date for the week's reading.  Currently uses the format set in "Short Date Format".

