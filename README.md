# Botium Connector for Landbot

[![NPM](https://nodei.co/npm/botium-connector-landbot.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/botium-connector-landbot/)

[![Codeship Status for codeforequity-at/botium-connector-landbot](https://app.codeship.com/projects/ac5ab3a0-d0f5-0138-cac3-16239a5027f5/status?branch=master)](https://app.codeship.com/projects/408148)
[![npm version](https://badge.fury.io/js/botium-connector-landbot.svg)](https://badge.fury.io/js/botium-connector-landbot)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)]()


This is a [Botium](https://github.com/codeforequity-at/botium-core) connector for testing your [Landbot API chatbot](https://app.landbot.io/).

__Did you read the [Botium in a Nutshell](https://medium.com/@floriantreml/botium-in-a-nutshell-part-1-overview-f8d0ceaf8fb4) articles? Be warned, without prior knowledge of Botium you won't be able to properly use this library!__

## How it works
Botium connects to the API of your Landbot chatbot.

It can be used as any other Botium connector with all Botium Stack components:
* [Botium CLI](https://github.com/codeforequity-at/botium-cli/)
* [Botium Bindings](https://github.com/codeforequity-at/botium-bindings/)
* [Botium Box](https://www.botium.at)

## Requirements
* **Node.js and NPM**
* a **Landbot API bot**
* a **project directory** on your workstation to hold test cases and Botium configuration

## Install Botium and Landbot Connector

When using __Botium CLI__:

```
> npm install -g botium-cli
> npm install -g botium-connector-landbot
> botium-cli init
> botium-cli run
```

When using __Botium Bindings__:

```
> npm install -g botium-bindings
> npm install -g botium-connector-landbot
> botium-bindings init mocha
> npm install && npm run mocha
```

When using __Botium Box__:

_Already integrated into Botium Box, no setup required_

## Connecting Landbot chatbot to Botium

Process is very simple, you have to know just the Auth token of your Landbot API channel.
  
Create a botium.json with this Auth token in your project directory: 

```
{
  "botium": {
    "Capabilities": {
      "PROJECTNAME": "<whatever>",
      "CONTAINERMODE": "landbot",
      "LANDBOT_TOKEN": "..."
    }
  }
}
```

To check the configuration, run the emulator (Botium CLI required) to bring up a chat interface in your terminal window:

```
> botium-cli emulator
```

Botium setup is ready, you can begin to write your [BotiumScript](https://botium.atlassian.net/wiki/spaces/BOTIUM/pages/491664/Botium+Scripting+-+BotiumScript) files.

## How to start samples

There is a small demo in [samples](./samples) with Botium Bindings. It uses real Landbot API chatbot.

### Real Landbot API chatbot sample

* Setup your Landbot API chatbot in [Landbot app](https://app.landbot.io/). Create a new Landbot API chatbot.
Modify the basic template according to this screen:

![Real example](https://github.com/codeforequity-at/botium-connector-landbot/blob/master/samples/real/real-example.png?raw=true)
  
* Install the dependencies and botium-core as peerDependency:
    ```
    > npm install && npm install --no-save botium-core
    ```
* Navigate into the _samples/real_ directory
    * Install the dependencies
        ```
        > cd ./samples/real
        > npm install
        ```
    * Adapt botium.json in the sample directory: 
        * Change Landbot token
        
    * Start `inbound-proxy` (it will listen on `http://127.0.0.1:45100/`):
         ```
         > npm run inbound
         ```
    * In your Landbot channel you need to set `HOOK URL(S)` according to the previous step set up inbound-proxy url. 
    (To make this localhost url public you can use e.g. [ngrok](https://ngrok.com/))
    * Finally run the test
        ```
        >  npm test
        ```

## Supported Capabilities

Set the capability __CONTAINERMODE__ to __landbot__ to activate this connector.

### LANDBOT_TOKEN
Landbot channel `AUTH TOKEN` field

### LANDBOT_API_TOKEN
This capability is need only if nlp data has to be processed as well e.g. for using it with [botium-coach](https://www.botium.ai/coach/). 
In this case you can find your API token under you landbot app account.

_Info: You need have a [dialogflow integration](https://help.landbot.io/article/j6n7arejz4-integrations-dialogflow-block) in you Landbot API chatbot,
and in dialogflow configuration the Query Response has to be set._

### LANDBOT_QUERY_RESULT
The value of this capability is `query_result` by default. 
The same value has to be set here as in the Query Response field in your dialogflow integration.

_If you don't set LANDBOT_API_TOKEN, this capability is ignored._ 
