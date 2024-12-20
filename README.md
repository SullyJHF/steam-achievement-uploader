# Steam Achievement Uploader

- [Steam Achievement Uploader](#steam-achievement-uploader)
  - [Setup](#setup)
    - [Prerequisites](#prerequisites)
    - [Starting](#starting)
  - [Future](#future)

This is a simple Tampermonkey script which attempts to bulk upload images for your steam game.
It does this by actually interacting with the forms on the achievement upload page.

## Setup

### Prerequisites

- [Tampermonkey](https://www.tampermonkey.net/) installed
- Some way to serve files in a local server
  - You can do this very easily with [python](https://www.python.org/)
- All your achievement image filenames named the same as their achievement IDs on steam
  - And organised into two directories, `achieved` and `unachieved`

### Starting

1. Download the latest version of uploader.js ([raw link](https://raw.githubusercontent.com/SullyJHF/steam-achievement-uploader/refs/heads/main/uploader.js)) and add it to your tampermonkey
2. Start a file server on port 8080 in the directory where the two directories containing the images is
   - e.g. if your achievement images are organised like the following:
        ```
        example/
        ├─ path/
        │  ├─ achieved/
        │  │  ├─ ACH_01.PNG
        │  │  ├─ ACH_02.PNG
        │  ├─ unachieved/
        │  │  ├─ LOCKED_ACH_01.PNG
        │  │  ├─ LOCKED_ACH_02.PNG
        ```
   - Then you would start the file server in the `example/path` directory
   - An example of how to do this would be running `python -m http.server 8080` in that dir
3. Navigate to your game's achievement upload page: `https://partner.steamgames.com/apps/achievements/<app_id>`
4. A new button will appear once the achievements have loaded with the text 'Bulk Upload'
5. Click that to start the process

## Future

At the moment this tool only uploads both the achieved and unachieved images, to already existing achievements.
Down the line I want to make it so you can store the details of all your achievements in a csv or similar, and have it actually add achievements - all fields, not just the images.

Also it would be really cool, and probably not that much extra effort, to actually make this just call the APIs instead of submitting the forms one by one, but again, I just made this as a quick hacky way to upload all the images at once, so if needs arise then I'll think about changing the way it works in future.
