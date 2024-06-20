<template>
  <el-container>
    <el-aside width="20%">
      <el-card shadow="always" style="margin: 10px;">
        <div slot="header">
          <el-upload action :limit="1" :on-change="uploadJSON" accpet=".json" :file-list="fileList">
            <el-button size="middle" type="primary">上传视频标注JSON</el-button>
          </el-upload>
        </div>
        <div>
          <span style="font-size: 20px;">事件片段列表</span>
        </div>
        <div style="display: flex">
          <el-table :data="originalVideoLabel['clip']" @row-click="eventRevise" ref="EventsRef" :key="boolUpdate" stripe
            :header-cell-style="{ 'text-align': 'center' }" style="cursor:pointer;margin:0 5px 0 5px;">
            <el-table-column prop="clipID" label="片段ID" align="center">
            </el-table-column>
            <el-table-column prop="event" label="事件动词" align="center">
            </el-table-column>
            <el-table-column prop="isRevised" label="是否已校对" align="center">
            </el-table-column>
          </el-table>
        </div>
        <div style="padding-top: 20px;">
          <el-button type="primary" @click="downloadJSON">导出修订版JSON</el-button>
        </div>
      </el-card>
    </el-aside>


    <el-container>
      <el-main style="padding:0px">
        <el-row>
          <el-card shadow="always" style="margin: 10px;">
            <div slot="header">
              <span style="font-size: 20px;">选择释义</span>
            </div>
            <div style="display: flex">
              <el-table :data="paraphraseList" :header-cell-style="{ 'text-align': 'center' }" stripe
                @row-click="updateParaphrase" style="cursor:pointer;margin:0 5px 0 5px;">
                <el-table-column prop="roleset_id" label="释义ID" align="center">
                </el-table-column>
                <el-table-column prop="roleset_name" label="释义描述" align="center">
                </el-table-column>
                <el-table-column prop="roleset_name_trans" label="释义翻译(可能不准，以英文为准)" align="center">
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-card shadow="always" style="margin: 10px;">
              <div slot="header">
                <span style="font-size: 20px;">原标注</span>
              </div>
              <div style="display: flex">
                <el-table :data="revisingEvent" :header-cell-style="{ 'text-align': 'center' }" stripe>
                  <el-table-column prop="argID" label="论元属性" width="100" align="center">
                  </el-table-column>
                  <el-table-column prop="value" label="值" align="center">
                  </el-table-column>
                  <el-table-column prop="meaning" label="含义" width="100" align="center">
                  </el-table-column>
                </el-table>
              </div>
            </el-card>
          </el-col>
          <el-col :span="14">
            <el-card shadow="always" style="margin: 10px;">
              <div slot="header">
                <span style="font-size: 20px;">新标注</span>
              </div>
              <div style="display: flex">
                <el-table :data="newEvent" :header-cell-style="{ 'text-align': 'center' }" stripe>
                  <el-table-column prop="argID" label="论元属性" width="100" align="center">
                  </el-table-column>
                  <el-table-column prop="descr" label="英文描述(以此为准)" align="center">
                  </el-table-column>
                  <el-table-column prop="descr_trans" label="描述翻译(可能不准)" align="center">
                  </el-table-column>
                  <el-table-column label="值">
                    <template slot-scope="scope">
                      <el-select allow-create clearable filterable placeholder="选择标注值(可自行输入)" v-model="scope.row.value">
                        <el-option v-for="item in revisingEvent" :key="item['argID'] + '：' + item['value']"
                          :label="item['argID'] + '：' + item['value']" :value="item['argID'] + '：' + item['value']">
                        </el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-row>
          <el-button @click="saveReviseChange">保存事件修订结果</el-button>
        </el-row>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import Vue from 'vue';
export default {
  data() {
    return {
      fileList: [],
      originalVideoLabel: {},
      revisingEvent: [],
      revisingEventArgumentValue: [],
      paraphraseList: [],
      newEvent: [],
      revisingEventID: 0,
      boolUpdate: false,
      revisedEvents: [],
      newVideoLabel: []
    }
  },
  methods: {
    uploadJSON(file, fileList) {
      this.fileList = fileList;
      var reader = new FileReader();
      reader.readAsText(file.raw);
      reader.onload = (e) => {
        this.originalVideoLabel = JSON.parse(e.target.result);
        this.originalVideoLabel['clip'].forEach(i => {
          i['isRevised'] = '否';
        });
        this.revisedEvents = [];
        this.revisingEvent = [];
        this.revisingEventArgumentValue = [];
      }
    },

    async eventRevise(row) {
      this.newEvent = [];
      this.revisingEventID = row['clipID'];
      this.revisingEvent = [];
      this.revisingEventArgumentValue = [];
      [
        'arg0_ins',
        'arg1_ins',
        'arg2_ins',
        'arg3_ins',
        'arg4_ins',
        'argM-LOC',
        'argM-EXT',
        'argM-AGT',
        'argM-PAT',
        'argM-INS',
        'argM-STP',
        'argM-EDP'
      ].forEach(argID => {
        let meaning = '';
        switch (argID.slice(3, 8)) {
          case '0_ins':
          case 'M-AGT':
            meaning = '主体';
            break;
          case '1_ins':
          case 'M-PAT':
            meaning = '客体';
            break;
          case '2_ins':
          case 'M-INS':
            meaning = '工具/属性/受益者';
            break;
          case '3_ins':
          case 'M-STP':
            meaning = '起点/属性/受益者';
            break;
          case '4_ins':
          case 'M-EDP':
            meaning = '终点';
            break;
          case 'M-LOC':
            meaning = '位置';
            break;
          case 'M-EXT':
            meaning = '程度';
            break;
          default:
            break;
        }
        const value = argID.includes('ins') ? row['instance'][argID] : row[argID]; // 检查是否属于 instance
        if (value != null && value != undefined) {
          this.revisingEvent.push({ 'argID': argID, 'value': value, 'meaning': meaning, 'isAdded': false });

          this.revisingEventArgumentValue.push(value);
        }
      });
      console.log("revisingEvent");
      console.log(this.revisingEvent);
      this.updateEventOption(row['event']);
    },


    /**
     * 更新词汇释义索引。Updates the event option with the specified value.
     *
     * @param {any} motion - 动词。The value to update the event option with.
     */
    updateEventOption(motion) {
      this.paraphraseList = []
      //去掉motion结尾的空白字符串或换行符
      motion = motion.trim();
      fetch(`${process.env.BASE_URL}frames_json/${motion}.json`)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
          else return response.json();
        })
        .then(data => {
          this.paraphraseList = data
        })
        .catch(error => {
          console.error('Error fetching and parsing JSON file:', error);
          //弹出提示框“没有检索到{$motion}对应的动词，请选择更合适的动词”，并弹出输入框，让用户输入正确的动词
          this.$prompt(`没有检索到${motion}对应的动词，请选择更合适的动词`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /\S/,
            inputErrorMessage: '动词不能为空'
          }).then(({ value }) => {
            Vue.set(this.originalVideoLabel['clip'][this.revisingEventID - 1], 'event', value);
            this.boolUpdate = !this.boolUpdate;
            this.updateEventOption(value);
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '取消输入'
            });
          });
        });



    },
    updateParaphrase(row) {
      const uid_value = row['uid'];
      this.newEvent = [];
      this.paraphraseList.forEach(item => {
        if (item["uid"] == uid_value) {
          console.log('true');
          item["roles"].forEach(role => {
            this.newEvent.push({ 'argID': "arg" + role["n"] + '_ins', 'value': '', 'descr': role["descr"], 'descr_trans': role["descr_trans"] });
          });
        }
      });
      console.log("newEvent");
      console.log(this.newEvent);
    },

    downloadJSON() {
      // update this.originalVideoLabel with this.newEvent
      this.newVideoLabel = this.originalVideoLabel;
      for (let key in this.revisedEvents) {
        this.newVideoLabel['clip'].forEach(clip => {
          if (clip['clipID'] == key) {
            delete clip["argM-LOC"];
            delete clip["argM-EXT"];
            // set all objects in clip['instance'] to null
            for (let key in clip['instance']) {
              clip['instance'][key] = null;
            }
            this.revisedEvents[key].forEach(arg => {
              if (arg['argID'].includes('ArgM')) {
                clip[arg['argID']] = arg['value'];
              } else if (arg['value'] != '' && arg['value'] != null && arg['value'] != undefined) {
                clip['instance'][arg['argID']] = arg['value'];
              }
            });

            console.log(this.newVideoLabel);
          }
        });
      }


      const json = JSON.stringify(this.newVideoLabel);
      const blob = new Blob([json], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = 'revised_' + this.originalVideoLabel['videoID'] + '.json';
      a.click();
      URL.revokeObjectURL(href);
    },
    saveReviseChange() {
      if (this.revisingEventID == 0) {
        this.$message({
          message: '请先选择事件片段',
          type: 'warning'
        });
        return;
      }

      //this.revisedEvents[this.revisingEventID] = this.newEvent;
      // 1. for each arg in this.revisingEvent,update 'isAdded' according to each object's 'value' in this.newEvent
      // 2. for each arg in this.revisingEvent, if 'isAdded' is false, add it to this.newEvent
      // 3. for each object's 'value' in this.newEvent, split it and remove the former part
      // 4. add this.newEvent to this.revisedEvents
      this.revisingEvent.forEach(arg => {
        this.newEvent.forEach(newArg => {
          if (arg['argID'] == newArg['value'].split('：')[0]) {
            arg['isAdded'] = true;
          }
        });
        if (!arg['isAdded']) {
          let newArgID = '';
          switch (arg['argID'].slice(3, 8)) {
            case '0_ins':
              newArgID = 'ArgM-AGT';
              break;
            case '1_ins':
              newArgID = 'ArgM-PAT';
              break;
            case '2_ins':
              newArgID = 'ArgM-INS';
              break;
            case '3_ins':
              newArgID = 'ArgM-STP';
              break;
            case '4_ins':
              newArgID = 'ArgM-EDP';
              break;
            case 'M-LOC':
              newArgID = 'ArgM-LOC';
              break;
            case 'M-EXT':
              newArgID = 'ArgM-EXT';
              break;
            default:
              break;
          }
          this.newEvent.push({ 'argID': newArgID, 'value': arg['argID'] + '：' + arg['value'] })
          arg['isAdded'] = true;
        }
      });
      this.newEvent.forEach(arg => {
        arg['value'] = arg['value'].split('：')[1].trim();
      });
      this.revisedEvents[this.revisingEventID] = this.newEvent;
      Vue.set(this.originalVideoLabel['clip'][this.revisingEventID - 1], 'isRevised', '是');
      this.boolUpdate = !this.boolUpdate;
      console.log("revisingEventID");
      console.log(this.revisingEventID);
      console.log("revisedEvents");
      console.log(this.revisedEvents);
      console.log("newEvent");
      console.log(this.newEvent);
      console.log("revisingEvent");
      console.log(this.revisingEvent);
      //原标注 this.revisingEvent
      //新标注 this.newEvent
      //更新后的暂存 this.revisedEvents

    }
  },
}
</script>
<style></style>