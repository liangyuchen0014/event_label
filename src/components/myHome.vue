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
          <el-table :data="originalVideoLabel['clip']" @row-click="eventRevise" ref="EventsRef" :key="boolUpdate"
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
      <el-main>
        <el-row>
          <el-card shadow="always" style="margin: 10px;">
            <div slot="header">
              <span style="font-size: 20px;">选择释义</span>
            </div>
            <div style="display: flex">
              <el-table :data="paraphraseList" :header-cell-style="{ 'text-align': 'center' }"
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
                <el-table :data="revisingEvent" :header-cell-style="{ 'text-align': 'center' }">
                  <el-table-column prop="argID" label="论元属性" width="100" align="center">
                  </el-table-column>
                  <el-table-column prop="value" label="值" align="center">
                  </el-table-column>
                  <el-table-column prop="meaning" label="含义" width="100" align="center">
                  </el-table-column>
                  <el-table-column label="操作" width="80" align="center">
                    <template slot-scope="scope">
                      <el-button @click="addArg(scope.row)" type="text" size="small">直接添加</el-button>
                    </template>
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
                <el-table :data="newEvent" :header-cell-style="{ 'text-align': 'center' }">
                  <el-table-column prop="argID" label="论元属性" width="100" align="center">
                  </el-table-column>
                  <el-table-column prop="descr" label="英文描述(以此为准)" align="center">
                  </el-table-column>
                  <el-table-column prop="descr_trans" label="描述翻译(可能不准)" align="center">
                  </el-table-column>
                  <el-table-column label="值">
                    <template slot-scope="scope">
                      <el-select allow-create clearable filterable placeholder="选择标注值(可自行输入)" v-model="scope.row.value">
                        <el-option v-for="item in revisingEventArgumentValue" :key="item" :label="item" :value="item">
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
      boolUpdate: false
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
      ].forEach(argID => {
        let meaning = '';
        switch (argID.slice(3, 8)) {
          case '0_ins':
            meaning = '主体';
            break;
          case '1_ins':
            meaning = '客体';
            break;
          case '2_ins':
            meaning = '工具/属性/受益者';
            break;
          case '3_ins':
            meaning = '起点/属性/受益者';
            break;
          case '4_ins':
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
          this.revisingEvent.push({ 'argID': argID, 'value': value, 'meaning': meaning });
          this.revisingEventArgumentValue.push(value);
        }
      });
      this.updateEventOption(row['event']);
    },


    /**
     * 更新词汇释义索引。Updates the event option with the specified value.
     *
     * @param {any} motion - 动词。The value to update the event option with.
     */
    updateEventOption(motion) {
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
        });
    },
    updateParaphrase(row) {
      const uid_value = row['uid'];
      this.newEvent = [];
      this.paraphraseList.forEach(item => {
        if (item["uid"] == uid_value) {
          console.log('true');
          item["roles"].forEach(role => {
            this.newEvent.push({ 'argID': "arg" + role["n"], 'value': '', 'descr': role["descr"], 'descr_trans': role["descr_trans"] });
          });
        }
      });
      console.log("newEvent");
      console.log(this.newEvent);
    },

    addArg(row) {
      let newArgID = '';
      switch (row['argID'].slice(3, 8)) {
        case '0_ins':
          newArgID = 'ARGM-AGT';
          break;
        case '1_ins':
          newArgID = 'ARGM-PAT';
          break;
        case '2_ins':
          newArgID = 'ARGM-INS';
          break;
        case '3_ins':
          newArgID = 'ARGM-STP';
          break;
        case '4_ins':
          newArgID = 'ARGM-EDP';
          break;
        case 'M-LOC':
          newArgID = 'ARGM-LOC';
          break;
        case 'M-EXT':
          newArgID = 'ARGM-EXT';
          break;
        default:
          break;
      }
      this.newEvent.push({ 'argID': newArgID, 'value': row['value'] })
      console.log("newEvent");
      console.log(this.newEvent);
    },
    downloadJSON() {
      const json = JSON.stringify(this.originalVideoLabel);
      const blob = new Blob([json], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = 'revised_' + this.originalVideoLabel['videoID'] + '.json';
      a.click();
      URL.revokeObjectURL(href);
    },
    saveReviseChange() {
      // save this.newEvent to the correspoding clip in this.newJson
      //1. remove 'argm' in original clip
      //2. add argM in this.newEvent to  original clip
      //3. add arg0 ~ arg4  in this.newEvent to 'instance' original clip
      //4. change isRevised to '是'
      console.log("revisingEventID");
      console.log(this.revisingEventID);
      this.originalVideoLabel['clip'].forEach(clip => {
        if (clip['clipID'] == this.revisingEventID) {
          delete clip["argM-LOC"];
          delete clip["argM-EXT"];
          // set all objects in clip['instance'] to null
          for (let key in clip['instance']) {
            clip['instance'][key] = null;
          }
          this.newEvent.forEach(arg => {
            if (arg['argID'].includes('ARGM')) {
              clip[arg['argID']] = arg['value'];
            } else if (arg['value'] != '' && arg['value'] != null && arg['value'] != undefined) {
              clip['instance'][arg['argID'] + '_ins'] = arg['value'];
            }
          });
          // clip['isRevised'] = '是';
          Vue.set(clip, 'isRevised', '是');
          console.log("originalVideoLabel");
          console.log(this.originalVideoLabel);
          this.boolUpdate = !this.boolUpdate;
          this.$nextTick(() => {
            this.$refs.EventsRef.doLayout();
          })
        }
      });
    }
  },
}
</script>
<style></style>